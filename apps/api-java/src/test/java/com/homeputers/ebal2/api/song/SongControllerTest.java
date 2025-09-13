package com.homeputers.ebal2.api.song;

import com.homeputers.ebal2.api.AbstractIntegrationTest;
import com.homeputers.ebal2.api.generated.model.SongRequest;
import com.homeputers.ebal2.api.generated.model.SongResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SongControllerTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void createSong() {
        SongRequest request = new SongRequest();
        request.setTitle("Test Song");

        ResponseEntity<SongResponse> response =
                restTemplate.postForEntity("/api/v1/songs", request, SongResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isNotNull();
        assertThat(response.getBody().getTitle()).isEqualTo("Test Song");
    }

    @Test
    void createSongValidationError() {
        SongRequest request = new SongRequest();

        ResponseEntity<String> response =
                restTemplate.postForEntity("/api/v1/songs", request, String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("title");
    }
}
