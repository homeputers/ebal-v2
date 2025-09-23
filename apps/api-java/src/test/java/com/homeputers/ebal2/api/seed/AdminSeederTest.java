package com.homeputers.ebal2.api.seed;

import com.homeputers.ebal2.api.domain.user.User;
import com.homeputers.ebal2.api.domain.user.UserMapper;
import com.homeputers.ebal2.api.domain.user.UserRoleMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminSeederTest {

    @Mock
    private UserMapper userMapper;

    @Mock
    private UserRoleMapper userRoleMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    private final DefaultApplicationArguments arguments = new DefaultApplicationArguments(new String[0]);

    @Test
    void seedsDefaultAdminWhenMissing() throws Exception {
        when(userMapper.findByEmail("admin@example.com")).thenReturn(null);
        when(passwordEncoder.encode("Secret123!"))
                .thenReturn("encoded-secret");

        AdminSeeder seeder = new AdminSeeder(userMapper, userRoleMapper, passwordEncoder,
                "  Admin@Example.com  ", "Secret123!");

        seeder.run(arguments);

        verify(userMapper).findByEmail("admin@example.com");
        ArgumentCaptor<String> emailCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> displayNameCaptor = ArgumentCaptor.forClass(String.class);
        verify(userMapper).insert(any(UUID.class), emailCaptor.capture(), displayNameCaptor.capture(),
                eq("encoded-secret"), eq(true), any(), any(), eq(0));
        assertThat(emailCaptor.getValue()).isEqualTo("admin@example.com");
        assertThat(displayNameCaptor.getValue()).isEqualTo("admin@example.com");
        verify(userRoleMapper).insert(any(UUID.class), eq("ADMIN"), any());
        verify(passwordEncoder).encode("Secret123!");
    }

    @Test
    void reactivatesAndAssignsRoleForExistingUser() throws Exception {
        UUID userId = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now().minusDays(1);
        User existing = new User(userId, "admin@example.com", null, null, "hash", false, createdAt, createdAt, 0);
        when(userMapper.findByEmail("admin@example.com")).thenReturn(existing);
        when(userRoleMapper.findRolesByUserId(userId)).thenReturn(List.of("VIEWER"));

        AdminSeeder seeder = new AdminSeeder(userMapper, userRoleMapper, passwordEncoder,
                "admin@example.com", "Secret123!");

        seeder.run(arguments);

        verify(userMapper).findByEmail("admin@example.com");
        verify(userMapper).updateActive(eq(userId), eq(true), any());
        verify(userRoleMapper).findRolesByUserId(userId);
        verify(userRoleMapper).insert(eq(userId), eq("ADMIN"), any());
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    void keepsExistingAdminUntouched() throws Exception {
        UUID userId = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now().minusDays(2);
        User existing = new User(userId, "admin@example.com", null, null, "hash", true, createdAt, createdAt, 0);
        when(userMapper.findByEmail("admin@example.com")).thenReturn(existing);
        when(userRoleMapper.findRolesByUserId(userId)).thenReturn(List.of("ADMIN", "PLANNER"));

        AdminSeeder seeder = new AdminSeeder(userMapper, userRoleMapper, passwordEncoder,
                "admin@example.com", "Secret123!");

        seeder.run(arguments);

        verify(userMapper).findByEmail("admin@example.com");
        verify(userMapper, never()).updateActive(any(UUID.class), anyBoolean(), any());
        verify(userRoleMapper).findRolesByUserId(userId);
        verify(userRoleMapper, never()).insert(any(UUID.class), anyString(), any());
        verify(passwordEncoder, never()).encode(anyString());
        verifyNoMoreInteractions(userMapper);
    }
}
