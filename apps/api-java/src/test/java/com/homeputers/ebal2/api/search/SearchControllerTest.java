package com.homeputers.ebal2.api.search;

import com.homeputers.ebal2.api.AbstractIntegrationTest;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.OffsetDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SearchControllerTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void searchAcrossEntities() {
        MemberRequest mr = new MemberRequest();
        mr.setDisplayName("Searchy Person");
        restTemplate.postForEntity("/api/v1/members", mr, MemberResponse.class);

        SongRequest sr = new SongRequest();
        sr.setTitle("Searchy Song");
        restTemplate.postForEntity("/api/v1/songs", sr, SongResponse.class);

        ServiceRequest svcReq = new ServiceRequest();
        svcReq.setStartsAt(OffsetDateTime.now().plusDays(1));
        svcReq.setLocation("Search Hall");
        restTemplate.postForEntity("/api/v1/services", svcReq, ServiceResponse.class);

        ResponseEntity<SearchResult[]> response =
                restTemplate.getForEntity("/api/v1/search?q=Search", SearchResult[].class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        List<SearchResult> results = List.of(response.getBody());
        assertThat(results).extracting(SearchResult::getKind)
                .contains(SearchResult.KindEnum.MEMBER,
                        SearchResult.KindEnum.SONG,
                        SearchResult.KindEnum.SERVICE);
    }
}

