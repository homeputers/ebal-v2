package com.homeputers.ebal2.api.service;

import com.homeputers.ebal2.api.domain.service.Service;
import com.homeputers.ebal2.api.domain.service.ServiceMapper;
import com.homeputers.ebal2.api.domain.token.ShareToken;
import com.homeputers.ebal2.api.domain.token.ShareTokenMapper;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;

@org.springframework.stereotype.Service
public class ServiceCalendarService {
    static final String CALENDAR_TOKEN_TYPE = "service_calendar";
    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'").withZone(ZoneOffset.UTC);
    private static final int DEFAULT_LIMIT = 200;

    private final ServiceMapper serviceMapper;
    private final ShareTokenMapper shareTokenMapper;

    public ServiceCalendarService(ServiceMapper serviceMapper, ShareTokenMapper shareTokenMapper) {
        this.serviceMapper = serviceMapper;
        this.shareTokenMapper = shareTokenMapper;
    }

    public String exportCalendar(String token) {
        ShareToken shareToken = lookupToken(token);
        if (shareToken == null) {
            throw new NoSuchElementException("Calendar token not found");
        }

        List<Service> upcoming = serviceMapper.findUpcoming(OffsetDateTime.now(ZoneOffset.UTC), DEFAULT_LIMIT);
        return buildCalendar(upcoming);
    }

    private ShareToken lookupToken(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        return shareTokenMapper.findByTokenAndType(token, CALENDAR_TOKEN_TYPE);
    }

    private String buildCalendar(List<Service> services) {
        StringBuilder sb = new StringBuilder();
        appendLine(sb, "BEGIN:VCALENDAR");
        appendLine(sb, "VERSION:2.0");
        appendLine(sb, "PRODID:-//Every Breath And Life//Service Calendar//EN");
        appendLine(sb, "CALSCALE:GREGORIAN");
        appendLine(sb, "METHOD:PUBLISH");
        appendLine(sb, "X-WR-CALNAME:Upcoming Services");

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        for (Service service : services) {
            if (service == null || service.startsAt() == null) {
                continue;
            }
            appendLine(sb, "BEGIN:VEVENT");
            appendLine(sb, "UID:" + service.id() + "@services.ebal");
            appendLine(sb, "DTSTAMP:" + formatDateTime(now));
            appendLine(sb, "DTSTART:" + formatDateTime(service.startsAt()));

            String location = service.location();
            String summary = location == null || location.isBlank()
                    ? "Service"
                    : "Service - " + location;
            appendLine(sb, "SUMMARY:" + escape(summary));

            if (location != null && !location.isBlank()) {
                appendLine(sb, "LOCATION:" + escape(location));
            }

            appendLine(sb, "END:VEVENT");
        }

        appendLine(sb, "END:VCALENDAR");
        return sb.toString();
    }

    private static String formatDateTime(OffsetDateTime value) {
        return DATE_TIME_FORMATTER.format(value.toInstant());
    }

    private static void appendLine(StringBuilder sb, String line) {
        sb.append(Objects.requireNonNullElse(line, ""));
        sb.append("\r\n");
    }

    private static String escape(String input) {
        if (input == null) {
            return "";
        }
        return input
                .replace("\\", "\\\\")
                .replace("\r\n", "\\n")
                .replace("\n", "\\n")
                .replace("\r", "\\n")
                .replace(",", "\\,")
                .replace(";", "\\;");
    }
}
