package com.homeputers.ebal2.api.auth;

import com.homeputers.ebal2.api.AbstractIntegrationTest;
import com.homeputers.ebal2.api.generated.model.CurrentUser;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthControllerTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void returnsAnonymousUser() {
        ResponseEntity<CurrentUser> response = restTemplate.getForEntity("/api/v1/auth/me", CurrentUser.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        CurrentUser currentUser = response.getBody();
        assertThat(currentUser).isNotNull();
        assertThat(currentUser.getSubject()).isNotNull();
        assertThat(currentUser.getSubject().isPresent()).isTrue();
        assertThat(currentUser.getSubject().get()).isEqualTo("anonymous");
        assertThat(currentUser.getDisplayName()).isEqualTo("Anonymous");
        assertThat(Boolean.TRUE.equals(currentUser.getAnonymous())).isTrue();
        assertThat(currentUser.getRoles()).isNotNull().isEmpty();
        assertThat(currentUser.getProvider()).isNotNull();
        assertThat(currentUser.getProvider().isPresent()).isFalse();
    }
}
