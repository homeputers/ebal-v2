package com.homeputers.ebal2.api.profile;

import com.homeputers.ebal2.api.profile.storage.LocalAvatarStorage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LocalAvatarStorageTest {

    private static final byte[] SAMPLE_PNG = new byte[]{
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, (byte) 0x90, 0x77, 0x53,
            (byte) 0xDE, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54,
            0x78, (byte) 0xDA, 0x63, 0x00, 0x01, 0x00, 0x00,
            0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, (byte) 0xB4,
            0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
            (byte) 0xAE, 0x42, 0x60, (byte) 0x82
    };

    @TempDir
    Path tempDir;

    private LocalAvatarStorage storage;

    @BeforeEach
    void setUp() {
        storage = new LocalAvatarStorage(tempDir, "/static/avatars/", 1024);
    }

    @Test
    void storesAvatarAndReturnsUrl() throws IOException {
        UUID userId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile("file", "avatar.png", "image/png", SAMPLE_PNG);

        String url = storage.store(userId, file);

        assertThat(url).isEqualTo("/static/avatars/" + userId + "/avatar.png");
        Path storedFile = tempDir.resolve(userId.toString()).resolve("avatar.png");
        assertThat(Files.exists(storedFile)).isTrue();
    }

    @Test
    void deleteRemovesAvatarDirectory() throws IOException {
        UUID userId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile("file", "avatar.png", "image/png", SAMPLE_PNG);
        storage.store(userId, file);

        storage.delete(userId);

        assertThat(tempDir.resolve(userId.toString())).doesNotExist();
    }

    @Test
    void rejectsUnsupportedContentType() {
        UUID userId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile("file", "avatar.txt", "text/plain", "hello".getBytes());

        assertThatThrownBy(() -> storage.store(userId, file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unsupported avatar format");
    }

    @Test
    void rejectsOversizedPayloads() {
        UUID userId = UUID.randomUUID();
        byte[] data = new byte[2048];
        System.arraycopy(SAMPLE_PNG, 0, data, 0, SAMPLE_PNG.length);
        MockMultipartFile file = new MockMultipartFile("file", "avatar.png", "image/png", data);

        assertThatThrownBy(() -> storage.store(userId, file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("maximum allowed size");
    }
}
