package com.homeputers.ebal2.api.member;

import com.homeputers.ebal2.api.AbstractIntegrationTest;
import com.homeputers.ebal2.api.TestAuthenticationHelper;
import com.homeputers.ebal2.api.generated.model.AuthLoginRequest;
import com.homeputers.ebal2.api.generated.model.AuthTokenPair;
import com.homeputers.ebal2.api.generated.model.MemberRequest;
import com.homeputers.ebal2.api.generated.model.MemberResponse;
import com.homeputers.ebal2.api.generated.model.PageMemberResponse;
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
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class MemberControllerTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private TestAuthenticationHelper authenticationHelper;

    @Test
    void createAndGetMember() {
        authenticationHelper.ensureUser("planner+member@example.com", "Secret123!", List.of("PLANNER"));
        AuthTokenPair tokens = authenticate("planner+member@example.com", "Secret123!");
        HttpHeaders headers = bearerHeaders(tokens.getAccessToken());

        MemberRequest request = new MemberRequest();
        request.setDisplayName("John Doe");
        request.setInstruments(List.of("guitar"));
        request.setEmail("john.doe@example.com");
        request.setPhoneNumber("+1 555 123 4567");
        request.setBirthdayMonth(5);
        request.setBirthdayDay(14);

        ResponseEntity<MemberResponse> create = restTemplate.exchange(
                "/api/v1/members",
                HttpMethod.POST,
                new HttpEntity<>(request, headers),
                MemberResponse.class);

        assertThat(create.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(create.getBody()).isNotNull();
        UUID id = create.getBody().getId();
        assertThat(id).isNotNull();

        ResponseEntity<MemberResponse> get = restTemplate.exchange(
                "/api/v1/members/" + id,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                MemberResponse.class);
        assertThat(get.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(get.getBody()).isNotNull();
        assertThat(get.getBody().getDisplayName()).isEqualTo("John Doe");
        assertThat(get.getBody().getEmail()).isEqualTo("john.doe@example.com");
        assertThat(get.getBody().getPhoneNumber()).isEqualTo("+1 555 123 4567");
        assertThat(get.getBody().getBirthdayMonth()).isEqualTo(5);
        assertThat(get.getBody().getBirthdayDay()).isEqualTo(14);
    }

    @Test
    void listMembers() {
        authenticationHelper.ensureUser("planner+memberlist@example.com", "Secret123!", List.of("PLANNER"));
        AuthTokenPair plannerTokens = authenticate("planner+memberlist@example.com", "Secret123!");
        HttpHeaders plannerHeaders = bearerHeaders(plannerTokens.getAccessToken());

        MemberRequest request = new MemberRequest();
        request.setDisplayName("Jane");
        request.setEmail("jane@example.com");
        request.setPhoneNumber("555-0001");
        request.setBirthdayMonth(7);
        request.setBirthdayDay(9);
        restTemplate.exchange(
                "/api/v1/members",
                HttpMethod.POST,
                new HttpEntity<>(request, plannerHeaders),
                MemberResponse.class);

        authenticationHelper.ensureUser("viewer+memberlist@example.com", "Secret123!", List.of("VIEWER"));
        AuthTokenPair viewerTokens = authenticate("viewer+memberlist@example.com", "Secret123!");
        HttpHeaders viewerHeaders = bearerHeaders(viewerTokens.getAccessToken());

        ResponseEntity<PageMemberResponse> response = restTemplate.exchange(
                "/api/v1/members?q=ja&page=0&size=10",
                HttpMethod.GET,
                new HttpEntity<>(viewerHeaders),
                PageMemberResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getContent()).isNotEmpty();
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
