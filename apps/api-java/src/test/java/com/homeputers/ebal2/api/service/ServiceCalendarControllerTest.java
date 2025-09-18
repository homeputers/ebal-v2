package com.homeputers.ebal2.api.service;

import com.homeputers.ebal2.api.AbstractIntegrationTest;
import com.homeputers.ebal2.api.domain.service.Service;
import com.homeputers.ebal2.api.domain.service.ServiceMapper;
import com.homeputers.ebal2.api.domain.token.ShareToken;
import com.homeputers.ebal2.api.domain.token.ShareTokenMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ServiceCalendarControllerTest extends AbstractIntegrationTest {

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'").withZone(ZoneOffset.UTC);

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ServiceMapper serviceMapper;

    @Autowired
    private ShareTokenMapper shareTokenMapper;

    @Test
    void exportsCalendarForValidToken() {
        String token = "calendar-token";
        shareTokenMapper.insert(new ShareToken(token, ServiceCalendarService.CALENDAR_TOKEN_TYPE, "Calendar", OffsetDateTime.now(ZoneOffset.UTC)));

        OffsetDateTime serviceStart = OffsetDateTime.now(ZoneOffset.UTC).plusDays(1).withNano(0);
        Service service = new Service(UUID.randomUUID(), serviceStart, "Main Hall");
        serviceMapper.insert(service);

        ResponseEntity<String> response = restTemplate.getForEntity("/api/v1/services/ical?token=" + token, String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getContentType()).isNotNull();
        assertThat(response.getHeaders().getContentType().toString()).startsWith("text/calendar");
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).contains("BEGIN:VCALENDAR");
        assertThat(response.getBody()).contains("SUMMARY:Service - Main Hall");
        assertThat(response.getBody()).contains("DTSTART:" + DATE_TIME_FORMATTER.format(serviceStart.toInstant()));
    }

    @Test
    void returnsNotFoundForUnknownToken() {
        ResponseEntity<String> response = restTemplate.getForEntity("/api/v1/services/ical?token=missing", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
