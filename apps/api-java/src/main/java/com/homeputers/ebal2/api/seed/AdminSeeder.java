package com.homeputers.ebal2.api.seed;

import com.homeputers.ebal2.api.domain.user.User;
import com.homeputers.ebal2.api.domain.user.UserMapper;
import com.homeputers.ebal2.api.domain.user.UserRoleMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Component
@ConditionalOnProperty(prefix = "ebal.seed", name = "enabled", havingValue = "true")
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);
    private static final String ADMIN_ROLE = "ADMIN";

    private final UserMapper userMapper;
    private final UserRoleMapper userRoleMapper;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public AdminSeeder(UserMapper userMapper,
                       UserRoleMapper userRoleMapper,
                       PasswordEncoder passwordEncoder,
                       @Value("${ebal.seed.admin.email:admin@example.com}") String adminEmail,
                       @Value("${ebal.seed.admin.password:ChangeMe123!}") String adminPassword) {
        this.userMapper = userMapper;
        this.userRoleMapper = userRoleMapper;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        String normalizedEmail = normalizeEmail(adminEmail);
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            log.warn("Skipping admin seed because ebal.seed.admin.email is blank");
            return;
        }
        if (adminPassword == null || adminPassword.isBlank()) {
            log.warn("Skipping admin seed because ebal.seed.admin.password is blank");
            return;
        }

        User existing = userMapper.findByEmail(normalizedEmail);
        OffsetDateTime now = OffsetDateTime.now();

        if (existing != null) {
            ensureActive(existing, now);
            ensureAdminRole(existing, now);
            return;
        }

        UUID userId = UUID.randomUUID();
        String passwordHash = passwordEncoder.encode(adminPassword);

        userMapper.insert(userId, normalizedEmail, passwordHash, true, now, now);
        userRoleMapper.insert(userId, ADMIN_ROLE, now);
        log.info("Seeded default admin user {}", normalizedEmail);
    }

    private void ensureActive(User user, OffsetDateTime now) {
        if (!user.isActive()) {
            userMapper.updateActive(user.id(), true, now);
            log.info("Reactivated admin user {} during seed", user.email());
        }
    }

    private void ensureAdminRole(User user, OffsetDateTime now) {
        List<String> roles = userRoleMapper.findRolesByUserId(user.id());
        boolean hasAdminRole = roles.stream().anyMatch(role -> ADMIN_ROLE.equalsIgnoreCase(role));
        if (!hasAdminRole) {
            userRoleMapper.insert(user.id(), ADMIN_ROLE, now);
            log.info("Granted ADMIN role to existing user {} during seed", user.email());
        }
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
