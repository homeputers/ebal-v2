package com.homeputers.ebal2.api.auth;

import com.homeputers.ebal2.api.AbstractIntegrationTest;
import com.homeputers.ebal2.api.TestAuthenticationHelper;
import com.homeputers.ebal2.api.config.SecurityProperties;
import com.homeputers.ebal2.api.domain.user.PasswordResetMapper;
import com.homeputers.ebal2.api.domain.user.PasswordResetToken;
import com.homeputers.ebal2.api.email.EmailSender;
import com.homeputers.ebal2.api.generated.model.AuthLoginRequest;
import com.homeputers.ebal2.api.generated.model.AuthTokenPair;
import com.homeputers.ebal2.api.generated.model.ChangePasswordRequest;
import com.homeputers.ebal2.api.generated.model.ForgotPasswordRequest;
import com.homeputers.ebal2.api.generated.model.RefreshTokenRequest;
import com.homeputers.ebal2.api.generated.model.ResetPasswordRequest;
import com.homeputers.ebal2.api.generated.model.User;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ProblemDetail;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthControllerTest extends AbstractIntegrationTest {

    private static final String EMAIL = "planner@example.com";
    private static final String PASSWORD = "Secret123!";

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private TestAuthenticationHelper authenticationHelper;

    @Autowired
    private JwtDecoder jwtDecoder;

    @Autowired
    private PasswordResetMapper passwordResetMapper;

    @Autowired
    private SecurityProperties securityProperties;

    @MockBean
    private EmailSender emailSender;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void returnsUnauthorizedWhenAnonymous() {
        ResponseEntity<ProblemDetail> response = restTemplate.getForEntity("/api/v1/auth/me", ProblemDetail.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getDetail()).isEqualTo("Authentication is required to access this resource.");
    }

    @Test
    void loginIssuesTokenPairAndAllowsCurrentUserLookup() {
        authenticationHelper.ensureUser(EMAIL, PASSWORD, List.of("PLANNER"));

        AuthTokenPair tokens = authenticate(EMAIL, PASSWORD);
        assertThat(tokens.getAccessToken()).isNotBlank();
        assertThat(tokens.getRefreshToken()).isNotBlank();
        assertThat(tokens.getExpiresIn()).isPositive();

        Jwt jwt = jwtDecoder.decode(tokens.getAccessToken());
        assertThat(jwt.getClaimAsStringList("roles")).contains("PLANNER");
        assertThat(jwt.getClaimAsString("email")).isEqualTo(EMAIL);

        ResponseEntity<User> meResponse = restTemplate.exchange(
                "/api/v1/auth/me",
                HttpMethod.GET,
                new HttpEntity<>(bearerHeaders(tokens.getAccessToken())),
                User.class);

        assertThat(meResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(meResponse.getBody()).isNotNull();
        assertThat(meResponse.getBody().getEmail()).isEqualTo(EMAIL);
    }

    @Test
    void loginRejectsInvalidCredentials() {
        authenticationHelper.ensureUser(EMAIL, PASSWORD, List.of("PLANNER"));

        AuthLoginRequest invalidRequest = new AuthLoginRequest();
        invalidRequest.setEmail(EMAIL);
        invalidRequest.setPassword("WrongPassword!");

        ResponseEntity<ProblemDetail> response = restTemplate.postForEntity(
                "/api/v1/auth/login",
                invalidRequest,
                ProblemDetail.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getDetail()).isEqualTo("Invalid email or password.");
    }

    @Test
    void refreshRotatesTokensAndRevokesOldRefreshToken() {
        authenticationHelper.ensureUser(EMAIL, PASSWORD, List.of("PLANNER"));
        AuthTokenPair initialTokens = authenticate(EMAIL, PASSWORD);

        RefreshTokenRequest refreshTokenRequest = new RefreshTokenRequest();
        refreshTokenRequest.setRefreshToken(initialTokens.getRefreshToken());
        ResponseEntity<AuthTokenPair> refreshResponse = restTemplate.postForEntity(
                "/api/v1/auth/refresh",
                refreshTokenRequest,
                AuthTokenPair.class);

        assertThat(refreshResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        AuthTokenPair rotated = refreshResponse.getBody();
        assertThat(rotated).isNotNull();
        assertThat(rotated.getAccessToken()).isNotBlank();
        assertThat(rotated.getRefreshToken()).isNotEqualTo(initialTokens.getRefreshToken());

        ResponseEntity<ProblemDetail> reuseResponse = restTemplate.postForEntity(
                "/api/v1/auth/refresh",
                refreshTokenRequest,
                ProblemDetail.class);

        assertThat(reuseResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void refreshRejectsUnknownToken() {
        authenticationHelper.ensureUser(EMAIL, PASSWORD, List.of("PLANNER"));

        RefreshTokenRequest refreshTokenRequest = new RefreshTokenRequest();
        refreshTokenRequest.setRefreshToken(UUID.randomUUID().toString());

        ResponseEntity<ProblemDetail> response = restTemplate.postForEntity(
                "/api/v1/auth/refresh",
                refreshTokenRequest,
                ProblemDetail.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getDetail()).isEqualTo("Refresh token is invalid or has expired.");
    }

    @Test
    void refreshRejectsExpiredToken() {
        authenticationHelper.ensureUser(EMAIL, PASSWORD, List.of("PLANNER"));
        AuthTokenPair tokens = authenticate(EMAIL, PASSWORD);

        OffsetDateTime expiredAt = OffsetDateTime.now().minusMinutes(5);
        jdbcTemplate.update("update refresh_tokens set expires_at = ? where token = ?", expiredAt, tokens.getRefreshToken());

        RefreshTokenRequest refreshTokenRequest = new RefreshTokenRequest();
        refreshTokenRequest.setRefreshToken(tokens.getRefreshToken());

        ResponseEntity<ProblemDetail> response = restTemplate.postForEntity(
                "/api/v1/auth/refresh",
                refreshTokenRequest,
                ProblemDetail.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getDetail()).isEqualTo("Refresh token is invalid or has expired.");
    }

    @Test
    void changePasswordRevokesRefreshTokensAndRequiresNewLogin() {
        authenticationHelper.ensureUser(EMAIL, PASSWORD, List.of("PLANNER"));
        AuthTokenPair initialTokens = authenticate(EMAIL, PASSWORD);

        ChangePasswordRequest changePasswordRequest = new ChangePasswordRequest();
        changePasswordRequest.setCurrentPassword(PASSWORD);
        changePasswordRequest.setNewPassword("NewSecret123!");

        HttpHeaders headers = bearerHeaders(initialTokens.getAccessToken());
        headers.setContentType(MediaType.APPLICATION_JSON);
        ResponseEntity<Void> changePasswordResponse = restTemplate.exchange(
                "/api/v1/auth/change-password",
                HttpMethod.POST,
                new HttpEntity<>(changePasswordRequest, headers),
                Void.class);

        assertThat(changePasswordResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        RefreshTokenRequest refreshTokenRequest = new RefreshTokenRequest();
        refreshTokenRequest.setRefreshToken(initialTokens.getRefreshToken());
        ResponseEntity<ProblemDetail> refreshAfterChange = restTemplate.postForEntity(
                "/api/v1/auth/refresh",
                refreshTokenRequest,
                ProblemDetail.class);
        assertThat(refreshAfterChange.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        AuthLoginRequest oldPasswordLogin = new AuthLoginRequest();
        oldPasswordLogin.setEmail(EMAIL);
        oldPasswordLogin.setPassword(PASSWORD);
        ResponseEntity<ProblemDetail> oldPasswordResponse = restTemplate.postForEntity(
                "/api/v1/auth/login",
                oldPasswordLogin,
                ProblemDetail.class);
        assertThat(oldPasswordResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        AuthTokenPair newTokens = authenticate(EMAIL, "NewSecret123!");
        assertThat(newTokens.getAccessToken()).isNotBlank();
    }

    @Test
    void forgotPasswordCreatesTokenWithExpectedTtlAndNotifiesSender() {
        UUID userId = authenticationHelper.ensureUser(EMAIL, PASSWORD, List.of("PLANNER"));
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail(EMAIL);
        OffsetDateTime beforeRequest = OffsetDateTime.now();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(HttpHeaders.ACCEPT_LANGUAGE, "es-MX");
        ResponseEntity<Void> response = restTemplate.exchange(
                "/api/v1/auth/forgot-password",
                HttpMethod.POST,
                new HttpEntity<>(request, headers),
                Void.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        PasswordResetToken token = passwordResetMapper.findLatestByUserId(userId);
        assertThat(token).isNotNull();
        assertThat(token.usedAt()).isNull();

        Duration actualTtl = Duration.between(beforeRequest, token.expiresAt());
        Duration expectedTtl = securityProperties.getPasswordReset().getTtl();
        long deltaSeconds = Math.abs(actualTtl.minus(expectedTtl).toSeconds());
        assertThat(deltaSeconds).isLessThanOrEqualTo(5);

        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Locale> localeCaptor = ArgumentCaptor.forClass(Locale.class);
        verify(emailSender).sendPasswordResetEmail(eq(EMAIL), urlCaptor.capture(), localeCaptor.capture());
        assertThat(urlCaptor.getValue()).contains(token.token());
        assertThat(localeCaptor.getValue().toLanguageTag()).isEqualTo("es-MX");
    }

    @Test
    void resetPasswordValidatesTokenAndRevokesRefreshTokens() {
        UUID userId = authenticationHelper.ensureUser(EMAIL, PASSWORD, List.of("PLANNER"));
        AuthTokenPair initialTokens = authenticate(EMAIL, PASSWORD);

        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail(EMAIL);
        restTemplate.postForEntity("/api/v1/auth/forgot-password", request, Void.class);
        PasswordResetToken token = passwordResetMapper.findLatestByUserId(userId);
        assertThat(token).isNotNull();

        ResetPasswordRequest resetRequest = new ResetPasswordRequest();
        resetRequest.setToken(token.token());
        resetRequest.setNewPassword("ResetSecret123!");
        ResponseEntity<Void> resetResponse = restTemplate.postForEntity(
                "/api/v1/auth/reset-password",
                resetRequest,
                Void.class);

        assertThat(resetResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        PasswordResetToken usedToken = passwordResetMapper.findByToken(token.token());
        assertThat(usedToken).isNotNull();
        assertThat(usedToken.usedAt()).isNotNull();

        RefreshTokenRequest refreshTokenRequest = new RefreshTokenRequest();
        refreshTokenRequest.setRefreshToken(initialTokens.getRefreshToken());
        ResponseEntity<ProblemDetail> refreshResponse = restTemplate.postForEntity(
                "/api/v1/auth/refresh",
                refreshTokenRequest,
                ProblemDetail.class);
        assertThat(refreshResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        AuthLoginRequest oldPasswordLogin = new AuthLoginRequest();
        oldPasswordLogin.setEmail(EMAIL);
        oldPasswordLogin.setPassword(PASSWORD);
        ResponseEntity<ProblemDetail> oldPasswordResponse = restTemplate.postForEntity(
                "/api/v1/auth/login",
                oldPasswordLogin,
                ProblemDetail.class);
        assertThat(oldPasswordResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        AuthTokenPair newTokens = authenticate(EMAIL, "ResetSecret123!");
        assertThat(newTokens.getAccessToken()).isNotBlank();

        ResponseEntity<ProblemDetail> reuseResponse = restTemplate.postForEntity(
                "/api/v1/auth/reset-password",
                resetRequest,
                ProblemDetail.class);
        assertThat(reuseResponse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void resetPasswordRejectsExpiredToken() {
        UUID userId = authenticationHelper.ensureUser(EMAIL, PASSWORD, List.of("PLANNER"));
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail(EMAIL);
        restTemplate.postForEntity("/api/v1/auth/forgot-password", request, Void.class);

        PasswordResetToken token = passwordResetMapper.findLatestByUserId(userId);
        assertThat(token).isNotNull();
        // Manually expire the token
        OffsetDateTime expiredAt = OffsetDateTime.now().minusMinutes(1);
        jdbcTemplate.update("update password_resets set expires_at = ? where token = ?", expiredAt, token.token());

        ResetPasswordRequest resetRequest = new ResetPasswordRequest();
        resetRequest.setToken(token.token());
        resetRequest.setNewPassword("AnotherSecret123!");

        ResponseEntity<ProblemDetail> response = restTemplate.postForEntity(
                "/api/v1/auth/reset-password",
                resetRequest,
                ProblemDetail.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    private AuthTokenPair authenticate(String email, String password) {
        AuthLoginRequest loginRequest = new AuthLoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);
        ResponseEntity<AuthTokenPair> response = restTemplate.postForEntity(
                "/api/v1/auth/login",
                loginRequest,
                AuthTokenPair.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        return response.getBody();
    }

    private HttpHeaders bearerHeaders(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        return headers;
    }
}
