package com.homeputers.ebal2.api.admin.user;

import com.homeputers.ebal2.api.AbstractIntegrationTest;
import com.homeputers.ebal2.api.TestAuthenticationHelper;
import com.homeputers.ebal2.api.auth.RefreshTokenService;
import com.homeputers.ebal2.api.domain.user.PasswordResetMapper;
import com.homeputers.ebal2.api.domain.user.PasswordResetToken;
import com.homeputers.ebal2.api.domain.user.RefreshToken;
import com.homeputers.ebal2.api.domain.user.RefreshTokenMapper;
import com.homeputers.ebal2.api.domain.user.User;
import com.homeputers.ebal2.api.domain.user.UserMapper;
import com.homeputers.ebal2.api.domain.user.UserRoleMapper;
import com.homeputers.ebal2.api.email.EmailSender;
import com.homeputers.ebal2.api.generated.model.CreateUserRequest;
import com.homeputers.ebal2.api.generated.model.Role;
import com.homeputers.ebal2.api.generated.model.UpdateUserRequest;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.i18n.LocaleContextHolder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@SpringBootTest
class UserAdminServiceTest extends AbstractIntegrationTest {

    @Autowired
    private UserAdminService userAdminService;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserRoleMapper userRoleMapper;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private RefreshTokenMapper refreshTokenMapper;

    @Autowired
    private PasswordResetMapper passwordResetMapper;

    @Autowired
    private TestAuthenticationHelper authenticationHelper;

    @MockBean
    private EmailSender emailSender;

    @Test
    void createUserPersistsRolesAndNormalizesEmail() {
        CreateUserRequest request = new CreateUserRequest();
        request.setEmail("  NEW.USER@EXAMPLE.COM  ");
        request.setDisplayName("  New User  ");
        request.setRoles(List.of(Role.ADMIN, Role.PLANNER));
        request.setTemporaryPassword("Temp123!");
        request.setIsActive(true);

        AdminUser created = userAdminService.createUser(request);

        User stored = userMapper.findByEmail("new.user@example.com");
        assertThat(stored).isNotNull();
        assertThat(stored.email()).isEqualTo("new.user@example.com");
        assertThat(stored.displayName()).isEqualTo("New User");

        List<String> roles = userRoleMapper.findRolesByUserId(created.user().id());
        assertThat(roles).containsExactlyInAnyOrder("ADMIN", "PLANNER");

        ArgumentCaptor<String> emailCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailSender).sendUserInvitationEmail(emailCaptor.capture(), eq("New User"), eq("Temp123!"), eq(Locale.ENGLISH));
        assertThat(emailCaptor.getValue()).isEqualTo("new.user@example.com");
    }

    @Test
    void createUserSendsInvitationUsingRequestLocale() {
        Locale spanish = Locale.forLanguageTag("es-MX");
        LocaleContextHolder.setLocale(spanish);
        try {
            CreateUserRequest request = new CreateUserRequest();
            request.setEmail("spanish.user@example.com");
            request.setDisplayName("Spanish User");
            request.setRoles(List.of(Role.ADMIN));
            request.setTemporaryPassword("Temp456!");

            userAdminService.createUser(request);

            verify(emailSender).sendUserInvitationEmail(
                    eq("spanish.user@example.com"),
                    eq("Spanish User"),
                    eq("Temp456!"),
                    eq(spanish));
        } finally {
            LocaleContextHolder.resetLocaleContext();
        }
    }

    @Test
    void updateUserRejectsRemovingLastAdmin() {
        UUID adminId = authenticationHelper.ensureUser("solo-admin@example.com", "Secret123!", List.of("ADMIN"));

        UpdateUserRequest request = new UpdateUserRequest();
        request.setRoles(List.of(Role.VIEWER));

        assertThatThrownBy(() -> userAdminService.updateUser(adminId, request))
                .isInstanceOf(LastAdminRemovalException.class);
    }

    @Test
    void deactivateUserRevokesRefreshTokens() {
        authenticationHelper.ensureUser("admin@example.com", "Secret123!", List.of("ADMIN"));
        UUID viewerId = authenticationHelper.ensureUser("viewer@example.com", "Secret123!", List.of("VIEWER"));

        RefreshToken token = refreshTokenService.create(viewerId, "JUnit", "127.0.0.1");
        assertThat(refreshTokenMapper.findByToken(token.token())).isNotNull();

        UpdateUserRequest request = new UpdateUserRequest();
        request.setIsActive(false);

        userAdminService.updateUser(viewerId, request);

        RefreshToken revoked = refreshTokenMapper.findByToken(token.token());
        assertThat(revoked).isNotNull();
        assertThat(revoked.revokedAt()).isNotNull();
    }

    @Test
    void deleteUserRejectsRemovingLastAdmin() {
        UUID adminId = authenticationHelper.ensureUser("last-admin@example.com", "Secret123!", List.of("ADMIN"));

        assertThatThrownBy(() -> userAdminService.deleteUser(adminId))
                .isInstanceOf(LastAdminRemovalException.class);
    }

    @Test
    void resetPasswordCreatesTokenAndNotifiesEmailSender() {
        authenticationHelper.ensureUser("admin2@example.com", "Secret123!", List.of("ADMIN"));
        UUID viewerId = authenticationHelper.ensureUser("reset-user@example.com", "Secret123!", List.of("VIEWER"));

        userAdminService.sendPasswordReset(viewerId);

        PasswordResetToken token = passwordResetMapper.findLatestByUserId(viewerId);
        assertThat(token).isNotNull();
        assertThat(token.usedAt()).isNull();
        assertThat(token.expiresAt()).isAfter(OffsetDateTime.now());

        verify(emailSender).sendPasswordResetEmail(eq("reset-user@example.com"), contains(token.token()), eq(Locale.ENGLISH));
    }
}
