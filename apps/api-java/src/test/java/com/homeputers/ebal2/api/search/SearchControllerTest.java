package com.homeputers.ebal2.api.search;

import com.homeputers.ebal2.api.AbstractIntegrationTest;
import com.homeputers.ebal2.api.TestAuthenticationHelper;
import com.homeputers.ebal2.api.generated.model.AuthLoginRequest;
import com.homeputers.ebal2.api.generated.model.AuthTokenPair;
import com.homeputers.ebal2.api.generated.model.MemberRequest;
import com.homeputers.ebal2.api.generated.model.MemberResponse;
import com.homeputers.ebal2.api.generated.model.SearchResult;
import com.homeputers.ebal2.api.generated.model.ServiceRequest;
import com.homeputers.ebal2.api.generated.model.ServiceResponse;
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

import java.time.OffsetDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SearchControllerTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private TestAuthenticationHelper authenticationHelper;

    @Test
    void searchAcrossEntities() {
        authenticationHelper.ensureUser("planner+search@example.com", "Secret123!", List.of("PLANNER"));
        AuthTokenPair plannerTokens = authenticate("planner+search@example.com", "Secret123!");
        HttpHeaders plannerHeaders = bearerHeaders(plannerTokens.getAccessToken());

        MemberRequest mr = new MemberRequest();
        mr.setDisplayName("Searchy Person");
        restTemplate.exchange(
                "/api/v1/members",
                HttpMethod.POST,
                new HttpEntity<>(mr, plannerHeaders),
                MemberResponse.class);

        SongRequest sr = new SongRequest();
        sr.setTitle("Searchy Song");
        restTemplate.exchange(
                "/api/v1/songs",
                HttpMethod.POST,
                new HttpEntity<>(sr, plannerHeaders),
                SongResponse.class);

        ServiceRequest svcReq = new ServiceRequest();
        svcReq.setStartsAt(OffsetDateTime.now().plusDays(1));
        svcReq.setLocation("Search Hall");
        restTemplate.exchange(
                "/api/v1/services",
                HttpMethod.POST,
                new HttpEntity<>(svcReq, plannerHeaders),
                ServiceResponse.class);

        authenticationHelper.ensureUser("viewer+search@example.com", "Secret123!", List.of("VIEWER"));
        AuthTokenPair viewerTokens = authenticate("viewer+search@example.com", "Secret123!");
        HttpHeaders viewerHeaders = bearerHeaders(viewerTokens.getAccessToken());

        ResponseEntity<SearchResult[]> response = restTemplate.exchange(
                "/api/v1/search?q=Search",
                HttpMethod.GET,
                new HttpEntity<>(viewerHeaders),
                SearchResult[].class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        List<SearchResult> results = List.of(response.getBody());
        assertThat(results).extracting(SearchResult::getKind)
                .contains(SearchResult.KindEnum.MEMBER,
                        SearchResult.KindEnum.SONG,
                        SearchResult.KindEnum.SERVICE);
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
