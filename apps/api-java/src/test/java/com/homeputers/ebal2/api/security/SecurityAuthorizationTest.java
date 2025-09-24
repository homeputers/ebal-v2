package com.homeputers.ebal2.api.security;

import com.homeputers.ebal2.api.AbstractIntegrationTest;
import com.homeputers.ebal2.api.TestAuthenticationHelper;
import com.homeputers.ebal2.api.generated.model.AuthLoginRequest;
import com.homeputers.ebal2.api.generated.model.AuthTokenPair;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SecurityAuthorizationTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private TestAuthenticationHelper authenticationHelper;

    @Test
    void adminCanAccessAdminEndpoints() {
        authenticationHelper.ensureUser("admin@example.com", "ChangeMe123!", List.of("ADMIN"));
        AuthTokenPair tokens = authenticate("admin@example.com", "ChangeMe123!");

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/admin/users",
                HttpMethod.GET,
                new HttpEntity<>(bearerHeaders(tokens.getAccessToken())),
                String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void plannerCannotAccessAdminEndpoints() {
        authenticationHelper.ensureUser("planner@example.com", "Secret123!", List.of("PLANNER"));
        AuthTokenPair tokens = authenticate("planner@example.com", "Secret123!");

        ResponseEntity<ProblemDetail> response = restTemplate.exchange(
                "/api/v1/admin/users",
                HttpMethod.GET,
                new HttpEntity<>(bearerHeaders(tokens.getAccessToken())),
                ProblemDetail.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void musicianHasReadOnlyAccessToDomainEndpoints() {
        authenticationHelper.ensureUser("musician@example.com", "Secret123!", List.of("MUSICIAN"));
        AuthTokenPair tokens = authenticate("musician@example.com", "Secret123!");

        ResponseEntity<String> listResponse = restTemplate.exchange(
                "/api/v1/services?page=0&size=5",
                HttpMethod.GET,
                new HttpEntity<>(bearerHeaders(tokens.getAccessToken())),
                String.class);

        assertThat(listResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        HttpHeaders headers = bearerHeaders(tokens.getAccessToken());
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<ProblemDetail> createResponse = restTemplate.exchange(
                "/api/v1/services",
                HttpMethod.POST,
                new HttpEntity<>("{}", headers),
                ProblemDetail.class);

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void viewerCannotModifyDomainEndpoints() {
        authenticationHelper.ensureUser("viewer@example.com", "Secret123!", List.of("VIEWER"));
        AuthTokenPair tokens = authenticate("viewer@example.com", "Secret123!");

        ResponseEntity<String> listResponse = restTemplate.exchange(
                "/api/v1/services?page=0&size=5",
                HttpMethod.GET,
                new HttpEntity<>(bearerHeaders(tokens.getAccessToken())),
                String.class);

        assertThat(listResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        HttpHeaders headers = bearerHeaders(tokens.getAccessToken());
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<ProblemDetail> createResponse = restTemplate.exchange(
                "/api/v1/services",
                HttpMethod.POST,
                new HttpEntity<>("{}", headers),
                ProblemDetail.class);

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
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
