package com.homeputers.ebal2.api.auth;

import com.homeputers.ebal2.api.config.SecurityProperties;
import com.homeputers.ebal2.api.domain.user.RefreshToken;
import com.homeputers.ebal2.api.domain.user.User;
import com.homeputers.ebal2.api.domain.user.UserMapper;
import com.homeputers.ebal2.api.domain.user.UserRoleMapper;
import com.homeputers.ebal2.api.generated.model.AuthTokenPair;
import com.homeputers.ebal2.api.security.JwtTokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
public class AuthService {

    private final UserMapper userMapper;
    private final UserRoleMapper userRoleMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final RefreshTokenService refreshTokenService;
    private final SecurityProperties securityProperties;

    public AuthService(UserMapper userMapper,
                       UserRoleMapper userRoleMapper,
                       PasswordEncoder passwordEncoder,
                       JwtTokenService jwtTokenService,
                       RefreshTokenService refreshTokenService,
                       SecurityProperties securityProperties) {
        this.userMapper = userMapper;
        this.userRoleMapper = userRoleMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
        this.refreshTokenService = refreshTokenService;
        this.securityProperties = securityProperties;
    }

    public AuthTokenPair login(String email, String password, String userAgent, String ipAddress) {
        refreshTokenService.deleteExpired();
        User user = findActiveUser(email);
        if (!passwordEncoder.matches(password, user.passwordHash())) {
            throw new InvalidCredentialsException();
        }
        List<String> roles = userRoleMapper.findRolesByUserId(user.id());
        return issueTokens(user, roles, userAgent, ipAddress);
    }

    public AuthTokenPair refresh(String refreshTokenValue, String userAgent, String ipAddress) {
        refreshTokenService.deleteExpired();
        RefreshToken existing = refreshTokenService.findActive(refreshTokenValue)
                .orElseThrow(InvalidRefreshTokenException::new);

        User user = userMapper.findById(existing.userId());
        if (user == null || !user.isActive()) {
            refreshTokenService.revoke(refreshTokenValue);
            throw new InvalidRefreshTokenException();
        }

        refreshTokenService.revoke(existing.token());
        List<String> roles = userRoleMapper.findRolesByUserId(user.id());
        return issueTokens(user, roles, userAgent, ipAddress);
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = findActiveUser(email);
        if (!passwordEncoder.matches(currentPassword, user.passwordHash())) {
            throw new InvalidCredentialsException();
        }
        OffsetDateTime now = OffsetDateTime.now();
        String newHash = passwordEncoder.encode(newPassword);
        userMapper.updatePassword(user.id(), newHash, now);
        refreshTokenService.revokeAllForUser(user.id());
    }

    private AuthTokenPair issueTokens(User user, List<String> roles, String userAgent, String ipAddress) {
        RefreshToken refreshToken = refreshTokenService.create(user.id(), userAgent, ipAddress);
        String accessToken = jwtTokenService.createAccessToken(user.id(), user.email(), roles);

        AuthTokenPair tokenPair = new AuthTokenPair();
        tokenPair.setAccessToken(accessToken);
        tokenPair.setRefreshToken(refreshToken.token());
        tokenPair.setExpiresIn(Math.toIntExact(securityProperties.getJwt().getAccessTokenTtl().toSeconds()));
        return tokenPair;
    }

    private User findActiveUser(String email) {
        if (!StringUtils.hasText(email)) {
            throw new InvalidCredentialsException();
        }
        String normalizedEmail = normalizeEmail(email);
        User user = userMapper.findByEmail(normalizedEmail);
        if (user == null || !user.isActive()) {
            throw new InvalidCredentialsException();
        }
        return user;
    }

    private String normalizeEmail(String email) {
        return Objects.requireNonNull(email).trim().toLowerCase(Locale.ROOT);
    }
}
