package com.homeputers.ebal2.api.auth;

import com.homeputers.ebal2.api.AbstractIntegrationTest;
import com.homeputers.ebal2.api.TestAuthenticationHelper;
import com.homeputers.ebal2.api.generated.model.AuthLoginRequest;
import com.homeputers.ebal2.api.generated.model.AuthTokenPair;
import com.homeputers.ebal2.api.generated.model.ChangePasswordRequest;
import com.homeputers.ebal2.api.generated.model.RefreshTokenRequest;
import com.homeputers.ebal2.api.generated.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ProblemDetail;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

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
