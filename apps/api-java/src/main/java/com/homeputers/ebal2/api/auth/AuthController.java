package com.homeputers.ebal2.api.auth;

import com.homeputers.ebal2.api.generated.AuthApi;
import com.homeputers.ebal2.api.generated.model.AuthLoginRequest;
import com.homeputers.ebal2.api.generated.model.AuthTokenPair;
import com.homeputers.ebal2.api.generated.model.ChangePasswordRequest;
import com.homeputers.ebal2.api.generated.model.ForgotPasswordRequest;
import com.homeputers.ebal2.api.generated.model.RefreshTokenRequest;
import com.homeputers.ebal2.api.generated.model.ResetPasswordRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class AuthController implements AuthApi {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final AuthRateLimiter authRateLimiter;
    private final HttpServletRequest request;

    public AuthController(AuthService authService,
                         PasswordResetService passwordResetService,
                         AuthRateLimiter authRateLimiter,
                         HttpServletRequest request) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
        this.authRateLimiter = authRateLimiter;
        this.request = request;
    }

    @Override
    public ResponseEntity<AuthTokenPair> login(AuthLoginRequest authLoginRequest) {
        String clientIp = resolveClientIpAddress();
        authRateLimiter.assertLoginAllowed(clientIp);
        AuthTokenPair tokenPair = authService.login(
                authLoginRequest.getEmail(),
                authLoginRequest.getPassword(),
                request.getHeader("User-Agent"),
                clientIp);
        authRateLimiter.resetLoginAttempts(clientIp);
        return ResponseEntity.ok(tokenPair);
    }

    @Override
    public ResponseEntity<AuthTokenPair> refreshAccessToken(RefreshTokenRequest refreshTokenRequest) {
        AuthTokenPair tokenPair = authService.refresh(
                refreshTokenRequest.getRefreshToken(),
                request.getHeader("User-Agent"),
                resolveClientIpAddress());
        return ResponseEntity.ok(tokenPair);
    }

    @Override
    public ResponseEntity<Void> changePassword(ChangePasswordRequest changePasswordRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        authService.changePassword(
                authentication.getName(),
                changePasswordRequest.getCurrentPassword(),
                changePasswordRequest.getNewPassword());
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> requestPasswordReset(ForgotPasswordRequest forgotPasswordRequest, String acceptLanguage) {
        String clientIp = resolveClientIpAddress();
        authRateLimiter.assertForgotPasswordAllowed(clientIp);
        passwordResetService.requestPasswordReset(
                forgotPasswordRequest.getEmail(),
                acceptLanguage);
        authRateLimiter.resetForgotPasswordAttempts(clientIp);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> completePasswordReset(ResetPasswordRequest resetPasswordRequest) {
        passwordResetService.resetPassword(
                resetPasswordRequest.getToken(),
                resetPasswordRequest.getNewPassword());
        return ResponseEntity.noContent().build();
    }

    private String resolveClientIpAddress() {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
