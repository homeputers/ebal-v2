package com.homeputers.ebal2.api.profile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.homeputers.ebal2.api.AbstractIntegrationTest;
import com.homeputers.ebal2.api.TestAuthenticationHelper;
import com.homeputers.ebal2.api.config.SelfServiceProperties;
import com.homeputers.ebal2.api.security.JwtTokenService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SelfServiceControllerTest extends AbstractIntegrationTest {

    private static final byte[] SAMPLE_PNG = new byte[]{
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, (byte) 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54,
            0x78, (byte) 0xDA, 0x63, 0x00, 0x01, 0x00, 0x00,
            0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, (byte) 0xB4,
            0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
            (byte) 0xAE, 0x42, 0x60, (byte) 0x82
    };

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TestAuthenticationHelper authenticationHelper;

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private SelfServiceProperties selfServiceProperties;

    @Test
    void requiresAuthenticationForProfile() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/v1/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void patchUpdatesDisplayName() throws Exception {
        String email = "profile@example.com";
        UUID userId = authenticationHelper.ensureUser(email, "Secret123!", List.of("PLANNER"));
        String token = jwtTokenService.createAccessToken(userId, email, List.of("PLANNER"));

        UpdateRequest payload = new UpdateRequest();
        payload.displayName = "Updated Name";

        mockMvc.perform(MockMvcRequestBuilders.patch("/api/v1/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(payload))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Updated Name"));
    }

    @Test
    void removingAvatarDeletesStoredFile() throws Exception {
        String email = "avatar@example.com";
        UUID userId = authenticationHelper.ensureUser(email, "Secret123!", List.of("PLANNER"));
        String token = jwtTokenService.createAccessToken(userId, email, List.of("PLANNER"));

        MockMultipartFile file = new MockMultipartFile("file", "avatar.png", "image/png", SAMPLE_PNG);
        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/v1/me/avatar")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk());

        Path storagePath = Path.of(selfServiceProperties.getAvatar().getStoragePath()).resolve(userId.toString());
        assertThat(Files.exists(storagePath)).isTrue();
        try (var paths = Files.list(storagePath)) {
            assertThat(paths.toList()).isNotEmpty();
        }

        UpdateRequest request = new UpdateRequest();
        request.avatarAction = "REMOVE";

        mockMvc.perform(MockMvcRequestBuilders.patch("/api/v1/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk());

        assertThat(storagePath).doesNotExist();
    }

    @Test
    void uploadRejectsOversizedImages() throws Exception {
        String email = "big@example.com";
        UUID userId = authenticationHelper.ensureUser(email, "Secret123!", List.of("PLANNER"));
        String token = jwtTokenService.createAccessToken(userId, email, List.of("PLANNER"));

        long size = selfServiceProperties.getAvatar().getMaxSizeBytes() + 1;
        byte[] oversized = new byte[(int) size];
        System.arraycopy(SAMPLE_PNG, 0, oversized, 0, Math.min(SAMPLE_PNG.length, oversized.length));

        MockMultipartFile file = new MockMultipartFile("file", "avatar.png", "image/png", oversized);
        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/v1/me/avatar")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void uploadRejectsUnsupportedMimeTypes() throws Exception {
        String email = "mime@example.com";
        UUID userId = authenticationHelper.ensureUser(email, "Secret123!", List.of("PLANNER"));
        String token = jwtTokenService.createAccessToken(userId, email, List.of("PLANNER"));

        MockMultipartFile file = new MockMultipartFile("file", "avatar.txt", MediaType.TEXT_PLAIN_VALUE, "hello".getBytes());
        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/v1/me/avatar")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private static final class UpdateRequest {
        public String displayName;
        public String avatarAction;
    }
}
