package com.homeputers.ebal2.api.member;

import com.homeputers.ebal2.api.AbstractIntegrationTest;
import com.homeputers.ebal2.api.generated.model.MemberRequest;
import com.homeputers.ebal2.api.generated.model.MemberResponse;
import com.homeputers.ebal2.api.generated.model.PageMemberResponse;
import com.homeputers.ebal2.api.member.MemberService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
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
    private MemberService memberService;

    @Test
    void createAndGetMember() {
        MemberRequest request = new MemberRequest();
        request.setDisplayName("John Doe");
        request.setInstruments(List.of("guitar"));

        ResponseEntity<MemberResponse> create =
                restTemplate.postForEntity("/api/v1/members", request, MemberResponse.class);

        assertThat(create.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(create.getBody()).isNotNull();
        UUID id = create.getBody().getId();
        assertThat(id).isNotNull();

        ResponseEntity<MemberResponse> get =
                restTemplate.getForEntity("/api/v1/members/" + id, MemberResponse.class);
        assertThat(get.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(get.getBody()).isNotNull();
        assertThat(get.getBody().getDisplayName()).isEqualTo("John Doe");
    }

    @Test
    void listMembers() {
        MemberRequest request = new MemberRequest();
        request.setDisplayName("Jane");
        memberService.create(request);

        ResponseEntity<PageMemberResponse> response =
                restTemplate.getForEntity("/api/v1/members?q=ja&page=0&size=10", PageMemberResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getContent()).isNotEmpty();
    }
}
