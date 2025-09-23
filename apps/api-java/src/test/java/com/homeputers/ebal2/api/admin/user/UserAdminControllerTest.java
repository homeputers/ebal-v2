package com.homeputers.ebal2.api.admin.user;

import com.homeputers.ebal2.api.AbstractIntegrationTest;
import com.homeputers.ebal2.api.TestAuthenticationHelper;
import com.homeputers.ebal2.api.generated.model.AuthLoginRequest;
import com.homeputers.ebal2.api.generated.model.AuthTokenPair;
import com.homeputers.ebal2.api.generated.model.CreateUserRequest;
import com.homeputers.ebal2.api.generated.model.PageUserResponse;
import com.homeputers.ebal2.api.generated.model.Role;
import com.homeputers.ebal2.api.generated.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UserAdminControllerTest extends AbstractIntegrationTest {

    private static final String ADMIN_EMAIL = "controller-admin@example.com";
    private static final String ADMIN_PASSWORD = "Secret123!";

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private TestAuthenticationHelper authenticationHelper;

    @MockBean
    private com.homeputers.ebal2.api.email.EmailSender emailSender;

    @BeforeEach
    void setUp() {
        authenticationHelper.ensureUser(ADMIN_EMAIL, ADMIN_PASSWORD, List.of("ADMIN"));
        doNothing().when(emailSender).sendUserInvitationEmail(any(), any(), any(), any());
        doNothing().when(emailSender).sendPasswordResetEmail(any(), any(), any());
    }

    @Test
    void adminEndpointsRequireAdminRole() {
        authenticationHelper.ensureUser("viewer-only@example.com", "Viewer123!", List.of("VIEWER"));
        AuthTokenPair viewerTokens = authenticate("viewer-only@example.com", "Viewer123!");

        HttpHeaders headers = bearerHeaders(viewerTokens.getAccessToken());
        ResponseEntity<ProblemDetail> response = restTemplate.exchange(
                "/api/v1/admin/users",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                ProblemDetail.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void listUsersSupportsPaginationAndFilters() {
        authenticationHelper.ensureUser("alice.admin@example.com", "Secret123!", List.of("ADMIN"));
        authenticationHelper.ensureUser("bob.viewer@example.com", "Secret123!", List.of("VIEWER"));
        authenticationHelper.ensureUser("carol.viewer@example.com", "Secret123!", List.of("VIEWER"));

        AuthTokenPair adminTokens = authenticate(ADMIN_EMAIL, ADMIN_PASSWORD);
        HttpHeaders headers = bearerHeaders(adminTokens.getAccessToken());

        ResponseEntity<PageUserResponse> response = restTemplate.exchange(
                "/api/v1/admin/users?q=car&isActive=true&page=0&size=20",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                PageUserResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        PageUserResponse body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getContent()).extracting(User::getEmail).contains("carol.viewer@example.com");
        assertThat(body.getContent()).extracting(User::getEmail).doesNotContain("bob.viewer@example.com");
    }

    @Test
    void createUserWithDuplicateEmailReturnsConflict() {
        authenticationHelper.ensureUser("existing@example.com", "Secret123!", List.of("VIEWER"));
        AuthTokenPair adminTokens = authenticate(ADMIN_EMAIL, ADMIN_PASSWORD);
        HttpHeaders headers = bearerHeaders(adminTokens.getAccessToken());
        headers.setContentType(MediaType.APPLICATION_JSON);

        CreateUserRequest request = new CreateUserRequest();
        request.setEmail("existing@example.com");
        request.setDisplayName("Existing");
        request.setRoles(List.of(Role.VIEWER));

        ResponseEntity<ProblemDetail> response = restTemplate.exchange(
                "/api/v1/admin/users",
                HttpMethod.POST,
                new HttpEntity<>(request, headers),
                ProblemDetail.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void getMissingUserReturnsNotFound() {
        AuthTokenPair adminTokens = authenticate(ADMIN_EMAIL, ADMIN_PASSWORD);
        HttpHeaders headers = bearerHeaders(adminTokens.getAccessToken());

        ResponseEntity<ProblemDetail> response = restTemplate.exchange(
                "/api/v1/admin/users/" + UUID.randomUUID(),
                HttpMethod.GET,
                new HttpEntity<>(headers),
                ProblemDetail.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
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
