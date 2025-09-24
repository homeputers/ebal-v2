package com.homeputers.ebal2.api;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;

@Testcontainers
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
public abstract class AbstractIntegrationTest {

    @Container
    private static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    private static final Path AVATAR_STORAGE = createAvatarTempDir();

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanDatabase() {
        jdbcTemplate.execute(
                "TRUNCATE TABLE email_change_tokens, refresh_tokens, password_resets, user_roles, users RESTART IDENTITY CASCADE");
        cleanAvatarStorage();
    }

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("ebal.security.enabled", () -> true);
        registry.add("ebal.security.jwt.secret",
                () -> "0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF");
        registry.add("ebal.security.cors.dev-origin", () -> "http://localhost:5173");
        registry.add("ebal.security.cors.prod-origin", () -> "");
        registry.add("ebal.profile.avatar.storage-path", () -> AVATAR_STORAGE.toString());
    }

    private static Path createAvatarTempDir() {
        try {
            Path tempDir = Files.createTempDirectory("avatar-storage-");
            tempDir.toFile().deleteOnExit();
            return tempDir;
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to create temporary avatar storage directory", ex);
        }
    }

    private void cleanAvatarStorage() {
        try {
            Files.list(AVATAR_STORAGE).forEach(this::deleteRecursively);
        } catch (IOException ignored) {
            // best-effort cleanup
        }
    }

    private void deleteRecursively(Path path) {
        try {
            Files.walkFileTree(path, new SimpleFileVisitor<>() {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                    Files.deleteIfExists(file);
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                    Files.deleteIfExists(dir);
                    return FileVisitResult.CONTINUE;
                }
            });
        } catch (IOException ignored) {
            // ignore
        }
    }
}
