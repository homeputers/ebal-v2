package com.homeputers.ebal2.api.profile;

import com.homeputers.ebal2.api.admin.user.DuplicateEmailException;
import com.homeputers.ebal2.api.auth.InvalidCredentialsException;
import com.homeputers.ebal2.api.auth.RefreshTokenService;
import com.homeputers.ebal2.api.config.MailProperties;
import com.homeputers.ebal2.api.config.SelfServiceProperties;
import com.homeputers.ebal2.api.domain.user.EmailChangeToken;
import com.homeputers.ebal2.api.domain.user.EmailChangeTokenMapper;
import com.homeputers.ebal2.api.domain.user.User;
import com.homeputers.ebal2.api.domain.user.UserMapper;
import com.homeputers.ebal2.api.domain.user.UserRoleMapper;
import com.homeputers.ebal2.api.email.EmailSender;
import com.homeputers.ebal2.api.generated.model.ChangeMyEmailRequest;
import com.homeputers.ebal2.api.generated.model.ChangePasswordRequest;
import com.homeputers.ebal2.api.generated.model.UpdateMyProfileRequest;
import com.homeputers.ebal2.api.generated.model.UploadAvatarResponse;
import com.homeputers.ebal2.api.profile.storage.AvatarStorage;
import com.homeputers.ebal2.api.profile.support.InvalidEmailChangeTokenException;
import com.homeputers.ebal2.api.profile.support.RateLimitExceededException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.context.i18n.LocaleContextHolder;

import java.io.IOException;
import java.net.URI;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Transactional
public class SelfServiceService {

    private static final int DISPLAY_NAME_MIN = 1;
    private static final int DISPLAY_NAME_MAX = 120;

    private final UserMapper userMapper;
    private final UserRoleMapper userRoleMapper;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final AvatarStorage avatarStorage;
    private final EmailChangeTokenMapper emailChangeTokenMapper;
    private final MailProperties mailProperties;
    private final EmailSender emailSender;
    private final SelfServiceProperties properties;

    private final ConcurrentHashMap<UUID, RateWindow> passwordRateLimiter = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<UUID, RateWindow> emailRateLimiter = new ConcurrentHashMap<>();

    public SelfServiceService(UserMapper userMapper,
                              UserRoleMapper userRoleMapper,
                              RefreshTokenService refreshTokenService,
                              PasswordEncoder passwordEncoder,
                              AvatarStorage avatarStorage,
                              EmailChangeTokenMapper emailChangeTokenMapper,
                              MailProperties mailProperties,
                              EmailSender emailSender,
                              SelfServiceProperties properties) {
        this.userMapper = userMapper;
        this.userRoleMapper = userRoleMapper;
        this.refreshTokenService = refreshTokenService;
        this.passwordEncoder = passwordEncoder;
        this.avatarStorage = avatarStorage;
        this.emailChangeTokenMapper = emailChangeTokenMapper;
        this.mailProperties = mailProperties;
        this.emailSender = emailSender;
        this.properties = properties;
    }

    @Transactional(readOnly = true)
    public MyProfileView getMyProfile(UUID userId) {
        User user = requireUser(userId);
        List<String> roles = userRoleMapper.findRolesByUserId(user.id());
        return mapToProfile(user, roles);
    }

    public MyProfileView updateMyProfile(UUID userId, UpdateMyProfileRequest request) {
        Objects.requireNonNull(request, "request");
        User user = requireUser(userId);
        boolean updated = false;
        if (request.getDisplayName() != null) {
            String desiredDisplayName = normalizeDisplayName(request.getDisplayName());
            if (!desiredDisplayName.equals(user.displayName())) {
                OffsetDateTime now = OffsetDateTime.now();
                userMapper.updateDisplayName(userId, desiredDisplayName, now);
                updated = true;
                user = userMapper.findById(userId);
            }
        }

        UpdateMyProfileRequest.AvatarActionEnum avatarAction = request.getAvatarAction();
        if (avatarAction == UpdateMyProfileRequest.AvatarActionEnum.REMOVE) {
            removeAvatar(userId);
            updated = true;
        }

        return getMyProfile(userId);
    }

    public UploadAvatarResponse uploadAvatar(UUID userId, MultipartFile file) {
        Objects.requireNonNull(file, "file");
        try {
            String avatarUrl = avatarStorage.store(userId, file);
            OffsetDateTime now = OffsetDateTime.now();
            userMapper.updateAvatar(userId, avatarUrl, now);
            UploadAvatarResponse response = new UploadAvatarResponse();
            response.setAvatarUrl(avatarUrl);
            return response;
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to store avatar", ex);
        }
    }

    public void removeAvatar(UUID userId) {
        try {
            avatarStorage.delete(userId);
        } catch (IOException ignored) {
            // swallow deletion issues for local storage
        }
        userMapper.updateAvatar(userId, null, OffsetDateTime.now());
    }

    public void changePassword(UUID userId, ChangePasswordRequest request) {
        Objects.requireNonNull(request, "request");
        enforceRateLimit(passwordRateLimiter, userId);
        User user = requireUser(userId);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.passwordHash())) {
            throw new InvalidCredentialsException();
        }
        String newHash = passwordEncoder.encode(request.getNewPassword());
        OffsetDateTime now = OffsetDateTime.now();
        userMapper.updatePassword(userId, newHash, now);
        refreshTokenService.revokeAllForUser(userId);
    }

    public void initiateEmailChange(UUID userId, ChangeMyEmailRequest request) {
        Objects.requireNonNull(request, "request");
        enforceRateLimit(emailRateLimiter, userId);
        User user = requireUser(userId);

        String normalizedNewEmail = normalizeEmail(request.getNewEmail());
        if (!StringUtils.hasText(normalizedNewEmail)) {
            throw new IllegalArgumentException("New email address is required.");
        }
        if (normalizedNewEmail.equals(user.email())) {
            throw new IllegalArgumentException("New email must be different from the current email.");
        }
        ensureEmailAvailable(normalizedNewEmail, userId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.passwordHash())) {
            throw new InvalidCredentialsException();
        }

        OffsetDateTime now = OffsetDateTime.now();
        emailChangeTokenMapper.deleteExpired(now);
        emailChangeTokenMapper.deleteByUserId(userId);

        UUID tokenId = UUID.randomUUID();
        String tokenValue = UUID.randomUUID().toString();
        OffsetDateTime expiresAt = now.plus(properties.getEmailChange().getTtl());
        emailChangeTokenMapper.insert(tokenId, userId, normalizedNewEmail, tokenValue, expiresAt, now);

        Locale locale = Objects.requireNonNullElse(LocaleContextHolder.getLocale(), Locale.ENGLISH);
        emailSender.sendEmailChangeConfirmationEmail(normalizedNewEmail, buildConfirmationUrl(tokenValue), locale);
    }

    public void confirmEmailChange(String tokenValue) {
        if (!StringUtils.hasText(tokenValue)) {
            throw new InvalidEmailChangeTokenException();
        }
        OffsetDateTime now = OffsetDateTime.now();
        emailChangeTokenMapper.deleteExpired(now);
        EmailChangeToken token = emailChangeTokenMapper.findByToken(tokenValue);
        if (token == null || token.isUsed() || token.expiresAt().isBefore(now)) {
            throw new InvalidEmailChangeTokenException();
        }

        User user = requireUser(token.userId());
        ensureEmailAvailable(token.newEmail(), user.id());

        emailChangeTokenMapper.markUsed(token.id(), now);
        userMapper.updateEmail(user.id(), token.newEmail(), now);
        refreshTokenService.revokeAllForUser(user.id());
    }

    private User requireUser(UUID userId) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new NoSuchElementException("User not found");
        }
        if (!user.isActive()) {
            throw new NoSuchElementException("User not found");
        }
        return user;
    }

    private void ensureEmailAvailable(String normalizedEmail, UUID userId) {
        User existing = userMapper.findByEmail(normalizedEmail);
        if (existing != null && !existing.id().equals(userId)) {
            throw new DuplicateEmailException(normalizedEmail);
        }
    }

    private MyProfileView mapToProfile(User user, List<String> roles) {
        return new MyProfileView(
                user.id(),
                user.email(),
                user.displayName(),
                user.avatarUrl(),
                roles,
                user.isActive(),
                user.createdAt(),
                user.updatedAt()
        );
    }

    private String normalizeDisplayName(String displayName) {
        String value = displayName != null ? displayName.trim() : null;
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException("Display name must not be blank.");
        }
        if (value.length() < DISPLAY_NAME_MIN || value.length() > DISPLAY_NAME_MAX) {
            throw new IllegalArgumentException("Display name must be between %d and %d characters.".formatted(
                    DISPLAY_NAME_MIN, DISPLAY_NAME_MAX));
        }
        return value;
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String buildConfirmationUrl(String tokenValue) {
        URI uri = UriComponentsBuilder.fromUriString(mailProperties.getFrontendBaseUrl())
                .path("/confirm-email")
                .queryParam("token", tokenValue)
                .build()
                .toUri();
        return uri.toString();
    }

    private void enforceRateLimit(ConcurrentHashMap<UUID, RateWindow> limiter, UUID userId) {
        if (userId == null) {
            return;
        }
        Instant now = Instant.now();
        limiter.compute(userId, (id, current) -> {
            if (current == null || now.isAfter(current.windowStart().plus(properties.getRateLimit().getWindow()))) {
                return new RateWindow(now, 1);
            }
            if (current.count() >= properties.getRateLimit().getMaxAttempts()) {
                throw new RateLimitExceededException("Too many attempts. Please try again later.");
            }
            return new RateWindow(current.windowStart(), current.count() + 1);
        });
    }

    private record RateWindow(Instant windowStart, int count) {
    }
}
