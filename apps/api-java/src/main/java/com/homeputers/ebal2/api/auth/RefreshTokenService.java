package com.homeputers.ebal2.api.auth;

import com.homeputers.ebal2.api.config.SecurityProperties;
import com.homeputers.ebal2.api.domain.user.RefreshToken;
import com.homeputers.ebal2.api.domain.user.RefreshTokenMapper;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenMapper refreshTokenMapper;
    private final SecurityProperties securityProperties;

    public RefreshTokenService(RefreshTokenMapper refreshTokenMapper, SecurityProperties securityProperties) {
        this.refreshTokenMapper = refreshTokenMapper;
        this.securityProperties = securityProperties;
    }

    public RefreshToken create(UUID userId, String userAgent, String ipAddress) {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime expiresAt = now.plus(securityProperties.getJwt().getRefreshTokenTtl());
        String token = UUID.randomUUID().toString();
        refreshTokenMapper.insert(token, userId, expiresAt, now, userAgent, ipAddress);
        return new RefreshToken(token, userId, expiresAt, null, now, userAgent, ipAddress);
    }

    public Optional<RefreshToken> findActive(String tokenValue) {
        RefreshToken token = refreshTokenMapper.findByToken(tokenValue);
        if (token == null) {
            return Optional.empty();
        }
        boolean expired = token.expiresAt() != null && token.expiresAt().isBefore(OffsetDateTime.now());
        boolean revoked = token.revokedAt() != null;
        if (expired || revoked) {
            return Optional.empty();
        }
        return Optional.of(token);
    }

    public void revoke(String tokenValue) {
        refreshTokenMapper.revoke(tokenValue, OffsetDateTime.now());
    }

    public void revokeAllForUser(UUID userId) {
        refreshTokenMapper.revokeByUserId(userId, OffsetDateTime.now());
    }

    public void deleteExpired() {
        refreshTokenMapper.deleteExpired(OffsetDateTime.now());
    }
}
