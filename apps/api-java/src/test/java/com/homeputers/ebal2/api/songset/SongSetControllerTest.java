package com.homeputers.ebal2.api.songset;

import com.homeputers.ebal2.api.AbstractIntegrationTest;
import com.homeputers.ebal2.api.generated.model.ArrangementRequest;
import com.homeputers.ebal2.api.generated.model.ArrangementResponse;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SongSetControllerTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void listSongSetItems_returnsPersistedItems() {
        SongSetRequest setRequest = new SongSetRequest();
        setRequest.setName("Integration Set");
        ResponseEntity<SongSetResponse> setResponse =
                restTemplate.postForEntity("/api/v1/song-sets", setRequest, SongSetResponse.class);
        assertThat(setResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        UUID songSetId = setResponse.getBody().getId();

        SongRequest songRequest = new SongRequest();
        songRequest.setTitle("Integration Song");
        ResponseEntity<SongResponse> songResponse =
                restTemplate.postForEntity("/api/v1/songs", songRequest, SongResponse.class);
        assertThat(songResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        UUID songId = songResponse.getBody().getId();

        ArrangementRequest arrangementRequest = new ArrangementRequest();
        arrangementRequest.setKey("C");
        ResponseEntity<ArrangementResponse> arrangementResponse = restTemplate.postForEntity(
                "/api/v1/songs/" + songId + "/arrangements",
                arrangementRequest,
                ArrangementResponse.class
        );
        assertThat(arrangementResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        UUID arrangementId = arrangementResponse.getBody().getId();

        SongSetItemRequest itemRequest = new SongSetItemRequest();
        itemRequest.setArrangementId(arrangementId);
        itemRequest.setSortOrder(0);
        itemRequest.setTranspose(2);
        itemRequest.setCapo(1);
        ResponseEntity<SongSetItemResponse> createItemResponse = restTemplate.postForEntity(
                "/api/v1/song-sets/" + songSetId + "/items",
                itemRequest,
                SongSetItemResponse.class
        );
        assertThat(createItemResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        ResponseEntity<SongSetItemResponse[]> itemsResponse = restTemplate.getForEntity(
                "/api/v1/song-sets/" + songSetId + "/items",
                SongSetItemResponse[].class
        );

        assertThat(itemsResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(itemsResponse.getBody()).isNotNull();
        assertThat(itemsResponse.getBody()).hasSize(1);

        SongSetItemResponse item = itemsResponse.getBody()[0];
        assertThat(item.getArrangementId()).isEqualTo(arrangementId);
        assertThat(item.getTranspose()).isEqualTo(2);
        assertThat(item.getCapo()).isEqualTo(1);
    }
}

