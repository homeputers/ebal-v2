package com.homeputers.ebal2.api.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class ProblemDetailHttpWriter {

    private final ObjectMapper objectMapper;

    public ProblemDetailHttpWriter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void write(HttpServletResponse response, ProblemDetail problemDetail) throws IOException {
        response.setStatus(problemDetail.getStatus());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(resolveContentType());
        objectMapper.writeValue(response.getWriter(), problemDetail);
    }

    private String resolveContentType() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return MediaType.APPLICATION_PROBLEM_JSON_VALUE;
        }

        HttpServletRequest request = attributes.getRequest();
        List<MediaType> acceptedTypes = MediaType.parseMediaTypes(request.getHeader(HttpHeaders.ACCEPT));
        if (acceptedTypes.isEmpty()) {
            return MediaType.APPLICATION_PROBLEM_JSON_VALUE;
        }

        MediaType.sortBySpecificityAndQuality(acceptedTypes);
        for (MediaType mediaType : acceptedTypes) {
            if (mediaType.includes(MediaType.APPLICATION_PROBLEM_JSON)) {
                return MediaType.APPLICATION_PROBLEM_JSON_VALUE;
            }
            if (mediaType.includes(MediaType.APPLICATION_JSON)) {
                return MediaType.APPLICATION_JSON_VALUE;
            }
            if (mediaType.isCompatibleWith(MediaType.APPLICATION_JSON)) {
                return MediaType.APPLICATION_JSON_VALUE;
            }
        }

        return MediaType.APPLICATION_PROBLEM_JSON_VALUE;
    }
}
