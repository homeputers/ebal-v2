package com.homeputers.ebal2.api.songset;

import com.homeputers.ebal2.api.AbstractIntegrationTest;
import com.homeputers.ebal2.api.TestAuthenticationHelper;
import com.homeputers.ebal2.api.generated.model.ArrangementRequest;
import com.homeputers.ebal2.api.generated.model.ArrangementResponse;
import com.homeputers.ebal2.api.generated.model.AuthLoginRequest;
import com.homeputers.ebal2.api.generated.model.AuthTokenPair;
import com.homeputers.ebal2.api.generated.model.SongRequest;
import com.homeputers.ebal2.api.generated.model.SongResponse;
import com.homeputers.ebal2.api.generated.model.SongSetItemRequest;
import com.homeputers.ebal2.api.generated.model.SongSetItemResponse;
import com.homeputers.ebal2.api.generated.model.SongSetRequest;
import com.homeputers.ebal2.api.generated.model.SongSetResponse;
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
class SongSetControllerTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private TestAuthenticationHelper authenticationHelper;

    @Test
    void listSongSetItems_returnsPersistedItems() {
        authenticationHelper.ensureUser("planner+songset@example.com", "Secret123!", List.of("PLANNER"));
        AuthTokenPair tokens = authenticate("planner+songset@example.com", "Secret123!");
        HttpHeaders headers = bearerHeaders(tokens.getAccessToken());

        SongSetRequest setRequest = new SongSetRequest();
        setRequest.setName("Integration Set");
        ResponseEntity<SongSetResponse> setResponse = restTemplate.exchange(
                "/api/v1/song-sets",
                HttpMethod.POST,
                new HttpEntity<>(setRequest, headers),
                SongSetResponse.class);
        assertThat(setResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        UUID songSetId = setResponse.getBody().getId();

        SongRequest songRequest = new SongRequest();
        songRequest.setTitle("Integration Song");
        ResponseEntity<SongResponse> songResponse = restTemplate.exchange(
                "/api/v1/songs",
                HttpMethod.POST,
                new HttpEntity<>(songRequest, headers),
                SongResponse.class);
        assertThat(songResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        UUID songId = songResponse.getBody().getId();

        ArrangementRequest arrangementRequest = new ArrangementRequest();
        arrangementRequest.setKey("C");
        ResponseEntity<ArrangementResponse> arrangementResponse = restTemplate.exchange(
                "/api/v1/songs/" + songId + "/arrangements",
                HttpMethod.POST,
                new HttpEntity<>(arrangementRequest, headers),
                ArrangementResponse.class);
        assertThat(arrangementResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        UUID arrangementId = arrangementResponse.getBody().getId();

        SongSetItemRequest itemRequest = new SongSetItemRequest();
        itemRequest.setArrangementId(arrangementId);
        itemRequest.setSortOrder(0);
        itemRequest.setTranspose(2);
        itemRequest.setCapo(1);
        ResponseEntity<SongSetItemResponse> createItemResponse = restTemplate.exchange(
                "/api/v1/song-sets/" + songSetId + "/items",
                HttpMethod.POST,
                new HttpEntity<>(itemRequest, headers),
                SongSetItemResponse.class);
        assertThat(createItemResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        ResponseEntity<SongSetItemResponse[]> itemsResponse = restTemplate.exchange(
                "/api/v1/song-sets/" + songSetId + "/items",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                SongSetItemResponse[].class);

        assertThat(itemsResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(itemsResponse.getBody()).isNotNull();
        assertThat(itemsResponse.getBody()).hasSize(1);

        SongSetItemResponse item = itemsResponse.getBody()[0];
        assertThat(item.getArrangementId()).isEqualTo(arrangementId);
        assertThat(item.getTranspose()).isEqualTo(2);
        assertThat(item.getCapo()).isEqualTo(1);
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
