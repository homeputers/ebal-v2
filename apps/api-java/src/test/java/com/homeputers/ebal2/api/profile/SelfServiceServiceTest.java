package com.homeputers.ebal2.api.profile;

import com.homeputers.ebal2.api.AbstractIntegrationTest;
import com.homeputers.ebal2.api.TestAuthenticationHelper;
import com.homeputers.ebal2.api.admin.user.DuplicateEmailException;
import com.homeputers.ebal2.api.auth.RefreshTokenService;
import com.homeputers.ebal2.api.domain.user.EmailChangeToken;
import com.homeputers.ebal2.api.domain.user.EmailChangeTokenMapper;
import com.homeputers.ebal2.api.domain.user.RefreshToken;
import com.homeputers.ebal2.api.domain.user.RefreshTokenMapper;
import com.homeputers.ebal2.api.domain.user.User;
import com.homeputers.ebal2.api.domain.user.UserMapper;
import com.homeputers.ebal2.api.email.EmailSender;
import com.homeputers.ebal2.api.generated.model.ChangeMyEmailRequest;
import com.homeputers.ebal2.api.generated.model.ChangePasswordRequest;
import com.homeputers.ebal2.api.profile.support.InvalidEmailChangeTokenException;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@SpringBootTest
class SelfServiceServiceTest extends AbstractIntegrationTest {

    private static final String PASSWORD = "Secret123!";

    @Autowired
    private SelfServiceService selfServiceService;

    @Autowired
    private TestAuthenticationHelper authenticationHelper;

    @Autowired
    private EmailChangeTokenMapper emailChangeTokenMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private RefreshTokenMapper refreshTokenMapper;

    @MockBean
    private EmailSender emailSender;

    @Test
    void emailChangeFlowUpdatesEmailAndRevokesTokens() {
        String email = "change@example.com";
        UUID userId = authenticationHelper.ensureUser(email, PASSWORD, List.of("PLANNER"));
        RefreshToken token = refreshTokenService.create(userId, "JUnit", "127.0.0.1");

        ChangeMyEmailRequest request = new ChangeMyEmailRequest();
        request.setCurrentPassword(PASSWORD);
        request.setNewEmail("new-email@example.com");

        selfServiceService.initiateEmailChange(userId, request);

        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailSender).sendEmailChangeConfirmationEmail(eq("new-email@example.com"), urlCaptor.capture(), any());
        String confirmationUrl = urlCaptor.getValue();
        String tokenValue = extractTokenFromUrl(confirmationUrl);
        assertThat(tokenValue).isNotBlank();

        EmailChangeToken pendingToken = emailChangeTokenMapper.findByToken(tokenValue);
        assertThat(pendingToken).isNotNull();
        assertThat(pendingToken.usedAt()).isNull();

        selfServiceService.confirmEmailChange(tokenValue);

        User updated = userMapper.findById(userId);
        assertThat(updated.email()).isEqualTo("new-email@example.com");

        EmailChangeToken consumedToken = emailChangeTokenMapper.findByToken(tokenValue);
        assertThat(consumedToken).isNotNull();
        assertThat(consumedToken.usedAt()).isNotNull();

        RefreshToken revoked = refreshTokenMapper.findByToken(token.token());
        assertThat(revoked.revokedAt()).isNotNull();
    }

    @Test
    void duplicateEmailChangeRequestIsRejected() {
        UUID firstUser = authenticationHelper.ensureUser("first@example.com", PASSWORD, List.of("PLANNER"));
        authenticationHelper.ensureUser("second@example.com", PASSWORD, List.of("PLANNER"));

        ChangeMyEmailRequest request = new ChangeMyEmailRequest();
        request.setCurrentPassword(PASSWORD);
        request.setNewEmail("SECOND@example.com");

        assertThatThrownBy(() -> selfServiceService.initiateEmailChange(firstUser, request))
                .isInstanceOf(DuplicateEmailException.class);
    }

    @Test
    void changePasswordRevokesExistingRefreshTokens() {
        String email = "password@example.com";
        UUID userId = authenticationHelper.ensureUser(email, PASSWORD, List.of("PLANNER"));
        refreshTokenService.create(userId, "JUnit", "127.0.0.1");
        refreshTokenService.create(userId, "JUnit", "127.0.0.1");

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword(PASSWORD);
        request.setNewPassword("NewSecret123!");

        selfServiceService.changePassword(userId, request);

        List<RefreshToken> tokens = refreshTokenMapper.findByUserId(userId);
        assertThat(tokens)
                .extracting(RefreshToken::revokedAt)
                .allMatch(value -> value != null && value.isAfter(OffsetDateTime.now().minusMinutes(5)));
    }

    @Test
    void confirmWithUnknownTokenFails() {
        assertThatThrownBy(() -> selfServiceService.confirmEmailChange("missing"))
                .isInstanceOf(InvalidEmailChangeTokenException.class);
    }

    private String extractTokenFromUrl(String url) {
        return UriComponentsBuilder.fromUriString(url)
                .build()
                .getQueryParams()
                .getFirst("token");
    }
}
