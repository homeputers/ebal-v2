package com.homeputers.ebal2.api.admin.user;

import com.homeputers.ebal2.api.auth.PasswordResetService;
import com.homeputers.ebal2.api.auth.RefreshTokenService;
import com.homeputers.ebal2.api.domain.user.User;
import com.homeputers.ebal2.api.domain.user.UserMapper;
import com.homeputers.ebal2.api.domain.user.UserRole;
import com.homeputers.ebal2.api.domain.user.UserRoleMapper;
import com.homeputers.ebal2.api.email.EmailSender;
import com.homeputers.ebal2.api.generated.model.CreateUserRequest;
import com.homeputers.ebal2.api.generated.model.UpdateUserRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
public class UserAdminService {

    private static final Logger log = LoggerFactory.getLogger(UserAdminService.class);
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int TEMP_PASSWORD_BYTES = 12;
    private static final String ADMIN_ROLE = "ADMIN";
    private static final Locale DEFAULT_LOCALE = Locale.ENGLISH;

    private final UserMapper userMapper;
    private final UserRoleMapper userRoleMapper;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetService passwordResetService;
    private final EmailSender emailSender;

    public UserAdminService(UserMapper userMapper,
                            UserRoleMapper userRoleMapper,
                            PasswordEncoder passwordEncoder,
                            RefreshTokenService refreshTokenService,
                            PasswordResetService passwordResetService,
                            EmailSender emailSender) {
        this.userMapper = userMapper;
        this.userRoleMapper = userRoleMapper;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
        this.passwordResetService = passwordResetService;
        this.emailSender = emailSender;
    }

    @Transactional(readOnly = true)
    public Page<AdminUser> searchUsers(String query, String role, Boolean isActive, Pageable pageable) {
        String normalizedQuery = normalizeQuery(query);
        String normalizedRole = normalizeRoleValue(role);
        Pageable effectivePageable = Objects.requireNonNull(pageable, "pageable");
        int limit = effectivePageable.getPageSize();
        int offset = (int) effectivePageable.getOffset();

        List<User> users = userMapper.search(normalizedQuery, normalizedRole, isActive, limit, offset);
        Map<UUID, List<String>> rolesByUserId = loadRoles(users);
        List<AdminUser> content = users.stream()
                .map(user -> new AdminUser(user, rolesByUserId.getOrDefault(user.id(), List.of())))
                .toList();

        int total = userMapper.countSearch(normalizedQuery, normalizedRole, isActive);
        return new PageImpl<>(content, effectivePageable, total);
    }

    @Transactional
    public AdminUser createUser(CreateUserRequest request) {
        Objects.requireNonNull(request, "request");
        List<String> normalizedRoles = normalizeRolesFromEnum(request.getRoles());
        if (normalizedRoles.isEmpty()) {
            throw new IllegalArgumentException("At least one role must be provided when creating a user.");
        }

        String temporaryPassword = resolveTemporaryPassword(request.getTemporaryPassword());
        String passwordHash = passwordEncoder.encode(temporaryPassword);
        boolean isActive = request.getIsActive() == null || Boolean.TRUE.equals(request.getIsActive());
        OffsetDateTime now = OffsetDateTime.now();

        User candidate = new User(
                null,
                request.getEmail(),
                request.getDisplayName(),
                passwordHash,
                isActive,
                now,
                now,
                0);

        ensureEmailAvailable(candidate.email());

        try {
            userMapper.insert(candidate.id(), candidate.email(), candidate.displayName(), candidate.passwordHash(),
                    candidate.isActive(), candidate.createdAt(), candidate.updatedAt(), candidate.version());
        } catch (DuplicateKeyException ex) {
            throw new DuplicateEmailException(candidate.email());
        }

        for (String role : normalizedRoles) {
            userRoleMapper.insert(candidate.id(), role, now);
        }

        emailSender.sendUserInvitationEmail(candidate.email(), candidate.displayName(), temporaryPassword, DEFAULT_LOCALE);

        logAdminAction("CREATE", candidate.id());
        return new AdminUser(candidate, normalizedRoles);
    }

    @Transactional(readOnly = true)
    public AdminUser getUser(UUID id) {
        User user = userMapper.findById(id);
        if (user == null) {
            throw new NoSuchElementException("User not found");
        }
        List<String> roles = normalizeRoles(userRoleMapper.findRolesByUserId(id));
        return new AdminUser(user, roles);
    }

    @Transactional
    public AdminUser updateUser(UUID id, UpdateUserRequest request) {
        Objects.requireNonNull(request, "request");
        User existing = userMapper.findById(id);
        if (existing == null) {
            throw new NoSuchElementException("User not found");
        }
        List<String> existingRoles = normalizeRoles(userRoleMapper.findRolesByUserId(id));

        List<String> desiredRoles = existingRoles;
        if (request.getRoles() != null) {
            desiredRoles = normalizeRolesFromEnum(request.getRoles());
            if (desiredRoles.isEmpty()) {
                throw new IllegalArgumentException("User must retain at least one role.");
            }
        }

        boolean desiredActive = request.getIsActive() != null ? request.getIsActive() : existing.isActive();
        String desiredDisplayName = normalizeDisplayName(request.getDisplayName(), existing.email(), existing.displayName());

        ensureNotLastAdminChange(id, existingRoles, desiredRoles, desiredActive);

        OffsetDateTime now = OffsetDateTime.now();
        int updatedRows = userMapper.updateUser(id, desiredDisplayName, desiredActive, now, existing.version());
        if (updatedRows == 0) {
            throw new OptimisticLockingFailureException("User was modified concurrently. Reload and try again.");
        }

        syncRoles(id, existingRoles, desiredRoles, now);

        if (existing.isActive() && !desiredActive) {
            refreshTokenService.revokeAllForUser(id);
        }

        User updated = userMapper.findById(id);
        List<String> updatedRoles = normalizeRoles(userRoleMapper.findRolesByUserId(id));

        logAdminAction("UPDATE", id);
        return new AdminUser(updated, updatedRoles);
    }

    @Transactional
    public void deleteUser(UUID id) {
        User existing = userMapper.findById(id);
        if (existing == null) {
            throw new NoSuchElementException("User not found");
        }
        List<String> roles = normalizeRoles(userRoleMapper.findRolesByUserId(id));
        ensureNotLastAdminChange(id, roles, List.of(), false);

        refreshTokenService.revokeAllForUser(id);
        userMapper.delete(id);

        logAdminAction("DELETE", id);
    }

    @Transactional
    public void sendPasswordReset(UUID id) {
        passwordResetService.sendPasswordResetForUser(id);
        refreshTokenService.revokeAllForUser(id);
        logAdminAction("RESET_PASSWORD", id);
    }

    private Map<UUID, List<String>> loadRoles(List<User> users) {
        Map<UUID, List<String>> rolesByUser = new LinkedHashMap<>();
        List<UUID> ids = users.stream().map(User::id).toList();
        if (ids.isEmpty()) {
            return rolesByUser;
        }
        List<UserRole> roles = userRoleMapper.findByUserIds(ids);
        for (UserRole role : roles) {
            String normalizedRole = normalizeRoleValue(role.role());
            if (normalizedRole == null) {
                continue;
            }
            rolesByUser.computeIfAbsent(role.userId(), ignored -> new java.util.ArrayList<>())
                    .add(normalizedRole);
        }
        for (Map.Entry<UUID, List<String>> entry : rolesByUser.entrySet()) {
            entry.setValue(List.copyOf(entry.getValue()));
        }
        return rolesByUser;
    }

    private String normalizeQuery(String query) {
        if (!StringUtils.hasText(query)) {
            return null;
        }
        return query.trim();
    }

    private String normalizeRoleValue(String role) {
        if (!StringUtils.hasText(role)) {
            return null;
        }
        return role.trim().toUpperCase(Locale.ROOT);
    }

    private List<String> normalizeRoles(List<String> roles) {
        if (roles == null) {
            return List.of();
        }
        Set<String> normalized = new LinkedHashSet<>();
        for (String role : roles) {
            if (StringUtils.hasText(role)) {
                normalized.add(role.trim().toUpperCase(Locale.ROOT));
            }
        }
        return List.copyOf(normalized);
    }

    private List<String> normalizeRolesFromEnum(List<com.homeputers.ebal2.api.generated.model.Role> roles) {
        if (roles == null) {
            return List.of();
        }
        Set<String> normalized = new LinkedHashSet<>();
        for (com.homeputers.ebal2.api.generated.model.Role role : roles) {
            if (role != null && StringUtils.hasText(role.getValue())) {
                normalized.add(role.getValue().trim().toUpperCase(Locale.ROOT));
            }
        }
        return List.copyOf(normalized);
    }

    private void ensureEmailAvailable(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email is required.");
        }
        User existing = userMapper.findByEmail(email);
        if (existing != null) {
            throw new DuplicateEmailException(email);
        }
    }

    private String resolveTemporaryPassword(String requested) {
        if (StringUtils.hasText(requested)) {
            return requested.trim();
        }
        byte[] bytes = new byte[TEMP_PASSWORD_BYTES];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String normalizeDisplayName(String requestedDisplayName, String email, String fallback) {
        String candidate = requestedDisplayName;
        if (candidate != null) {
            candidate = candidate.trim();
        }
        if (!StringUtils.hasText(candidate)) {
            candidate = StringUtils.hasText(fallback) ? fallback : email;
        }
        return candidate == null ? "" : candidate;
    }

    private void syncRoles(UUID userId, List<String> currentRoles, List<String> desiredRoles, OffsetDateTime now) {
        Set<String> current = new LinkedHashSet<>(currentRoles);
        Set<String> desired = new LinkedHashSet<>(desiredRoles);

        for (String role : current) {
            if (!desired.contains(role)) {
                userRoleMapper.delete(userId, role);
            }
        }
        for (String role : desired) {
            if (!current.contains(role)) {
                userRoleMapper.insert(userId, role, now);
            }
        }
    }

    private void ensureNotLastAdminChange(UUID userId, List<String> currentRoles, List<String> desiredRoles, boolean desiredActive) {
        boolean wasAdmin = currentRoles.stream().anyMatch(role -> ADMIN_ROLE.equalsIgnoreCase(role));
        boolean willBeAdmin = desiredActive && desiredRoles.stream().anyMatch(role -> ADMIN_ROLE.equalsIgnoreCase(role));
        if (wasAdmin && !willBeAdmin) {
            int remainingAdmins = userRoleMapper.countByRoleExcludingUser(ADMIN_ROLE, userId);
            if (remainingAdmins == 0) {
                throw new LastAdminRemovalException();
            }
        }
    }

    private void logAdminAction(String action, UUID targetUserId) {
        UUID actorId = resolveCurrentAdminId();
        log.info("Admin {} performed {} on user {} at {}", actorId, action, targetUserId, OffsetDateTime.now());
    }

    private UUID resolveCurrentAdminId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwt) {
            String subject = jwt.getToken().getSubject();
            if (StringUtils.hasText(subject)) {
                try {
                    return UUID.fromString(subject);
                } catch (IllegalArgumentException ignored) {
                    // fall through to name-based identifier
                }
            }
        }
        if (authentication != null && StringUtils.hasText(authentication.getName())) {
            return UUID.nameUUIDFromBytes(authentication.getName().getBytes(StandardCharsets.UTF_8));
        }
        return UUID.nameUUIDFromBytes("anonymous-admin".getBytes(StandardCharsets.UTF_8));
    }
}
