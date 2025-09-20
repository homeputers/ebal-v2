package com.homeputers.ebal2.api.song;

import com.homeputers.ebal2.api.AbstractIntegrationTest;
import com.homeputers.ebal2.api.TestAuthenticationHelper;
import com.homeputers.ebal2.api.generated.model.AuthLoginRequest;
import com.homeputers.ebal2.api.generated.model.AuthTokenPair;
import com.homeputers.ebal2.api.generated.model.SongRequest;
import com.homeputers.ebal2.api.generated.model.SongResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SongControllerTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private TestAuthenticationHelper authenticationHelper;

    @Test
    void createSong() {
        authenticationHelper.ensureUser("planner+song@example.com", "Secret123!", List.of("PLANNER"));
        AuthTokenPair tokens = authenticate("planner+song@example.com", "Secret123!");
        HttpHeaders headers = bearerHeaders(tokens.getAccessToken());

        SongRequest request = new SongRequest();
        request.setTitle("Test Song");

        ResponseEntity<SongResponse> response = restTemplate.exchange(
                "/api/v1/songs",
                HttpMethod.POST,
                new HttpEntity<>(request, headers),
                SongResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isNotNull();
        assertThat(response.getBody().getTitle()).isEqualTo("Test Song");
    }

    @Test
    void createSongValidationError() {
        authenticationHelper.ensureUser("planner+songvalidation@example.com", "Secret123!", List.of("PLANNER"));
        AuthTokenPair tokens = authenticate("planner+songvalidation@example.com", "Secret123!");
        HttpHeaders headers = bearerHeaders(tokens.getAccessToken());

        SongRequest request = new SongRequest();

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/songs",
                HttpMethod.POST,
                new HttpEntity<>(request, headers),
                String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("title");
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

    private HttpHeaders bearerHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return headers;
    }
}
