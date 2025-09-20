package com.homeputers.ebal2.api;

import com.homeputers.ebal2.api.domain.user.User;
import com.homeputers.ebal2.api.domain.user.UserMapper;
import com.homeputers.ebal2.api.domain.user.UserRoleMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Component
public class TestAuthenticationHelper {

    private final UserMapper userMapper;
    private final UserRoleMapper userRoleMapper;
    private final PasswordEncoder passwordEncoder;

    public TestAuthenticationHelper(UserMapper userMapper,
                                    UserRoleMapper userRoleMapper,
                                    PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.userRoleMapper = userRoleMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public UUID ensureUser(String email, String password, List<String> roles) {
        String normalizedEmail = normalizeEmail(email);
        OffsetDateTime now = OffsetDateTime.now();
        User existing = userMapper.findByEmail(normalizedEmail);
        String passwordHash = passwordEncoder.encode(password);

        if (existing == null) {
            UUID userId = UUID.randomUUID();
            userMapper.insert(userId, normalizedEmail, passwordHash, true, now, now);
            assignRoles(userId, roles, now);
            return userId;
        }

        userMapper.updatePassword(existing.id(), passwordHash, now);
        userMapper.updateActive(existing.id(), true, now);
        refreshRoles(existing.id(), roles, now);
        return existing.id();
    }

    private void assignRoles(UUID userId, List<String> roles, OffsetDateTime now) {
        for (String role : roles) {
            userRoleMapper.insert(userId, normalizeRole(role), now);
        }
    }

    private void refreshRoles(UUID userId, List<String> desiredRoles, OffsetDateTime now) {
        Set<String> desired = desiredRoles.stream().map(this::normalizeRole).collect(HashSet::new, Set::add, Set::addAll);
        Set<String> existing = new HashSet<>(userRoleMapper.findRolesByUserId(userId)
                .stream().map(this::normalizeRole).toList());

        for (String role : existing) {
            if (!desired.contains(role)) {
                userRoleMapper.delete(userId, role);
            }
        }
        for (String role : desired) {
            if (!existing.contains(role)) {
                userRoleMapper.insert(userId, role, now);
            }
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeRole(String role) {
        return role == null ? null : role.trim().toUpperCase(Locale.ROOT);
    }
}
