package com.homeputers.ebal2.api.auth;

import com.homeputers.ebal2.api.config.MailProperties;
import com.homeputers.ebal2.api.config.SecurityProperties;
import com.homeputers.ebal2.api.domain.user.PasswordResetMapper;
import com.homeputers.ebal2.api.domain.user.PasswordResetToken;
import com.homeputers.ebal2.api.domain.user.User;
import com.homeputers.ebal2.api.domain.user.UserMapper;
import com.homeputers.ebal2.api.email.EmailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final PasswordResetMapper passwordResetMapper;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final SecurityProperties securityProperties;
    private final MailProperties mailProperties;
    private final EmailSender emailSender;

    public PasswordResetService(PasswordResetMapper passwordResetMapper,
                                UserMapper userMapper,
                                PasswordEncoder passwordEncoder,
                                RefreshTokenService refreshTokenService,
                                SecurityProperties securityProperties,
                                MailProperties mailProperties,
                                EmailSender emailSender) {
        this.passwordResetMapper = passwordResetMapper;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
        this.securityProperties = securityProperties;
        this.mailProperties = mailProperties;
        this.emailSender = emailSender;
    }

    public void requestPasswordReset(String email, String acceptLanguage) {
        if (!StringUtils.hasText(email)) {
            return;
        }

        String normalizedEmail = normalizeEmail(email);
        User user = userMapper.findByEmail(normalizedEmail);
        if (user == null || !user.isActive()) {
            return;
        }

        OffsetDateTime now = OffsetDateTime.now();
        passwordResetMapper.deleteExpired(now);

        String token = UUID.randomUUID().toString();
        OffsetDateTime expiresAt = now.plus(securityProperties.getPasswordReset().getTtl());
        passwordResetMapper.insert(token, user.id(), expiresAt, now);

        String resetUrl = buildResetUrl(token);
        Locale locale = resolveLocale(acceptLanguage);
        emailSender.sendPasswordResetEmail(user.email(), resetUrl, locale);
    }

    public void resetPassword(String token, String newPassword) {
        if (!StringUtils.hasText(token) || !StringUtils.hasText(newPassword)) {
            throw new InvalidPasswordResetTokenException();
        }

        OffsetDateTime now = OffsetDateTime.now();
        passwordResetMapper.deleteExpired(now);

        PasswordResetToken resetToken = passwordResetMapper.findByToken(token);
        if (resetToken == null) {
            throw new InvalidPasswordResetTokenException();
        }
        if (resetToken.usedAt() != null) {
            throw new InvalidPasswordResetTokenException();
        }
        if (!resetToken.expiresAt().isAfter(now)) {
            throw new InvalidPasswordResetTokenException();
        }

        User user = userMapper.findById(resetToken.userId());
        if (user == null || !user.isActive()) {
            throw new InvalidPasswordResetTokenException();
        }

        String newHash = passwordEncoder.encode(newPassword);
        userMapper.updatePassword(user.id(), newHash, now);
        passwordResetMapper.markUsed(token, now);
        refreshTokenService.revokeAllForUser(user.id());
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String buildResetUrl(String token) {
        URI uri = UriComponentsBuilder.fromUriString(mailProperties.getFrontendBaseUrl())
                .path("/reset-password")
                .queryParam("token", token)
                .build()
                .toUri();
        return uri.toString();
    }

    private Locale resolveLocale(String acceptLanguage) {
        if (StringUtils.hasText(acceptLanguage)) {
            try {
                List<Locale.LanguageRange> ranges = Locale.LanguageRange.parse(acceptLanguage);
                for (Locale.LanguageRange range : ranges) {
                    Locale locale = Locale.forLanguageTag(range.getRange());
                    if (StringUtils.hasText(locale.getLanguage())) {
                        return locale;
                    }
                }
            } catch (IllegalArgumentException ignored) {
                // ignore malformed headers and fall back to default
            }
        }
        return Locale.ENGLISH;
    }
}
