package com.homeputers.ebal2.api.profile.storage;

import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.StandardOpenOption;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Objects;
import java.util.UUID;

public class LocalAvatarStorage implements AvatarStorage {

    private final Path root;
    private final String publicBaseUrl;
    private final long maxSizeBytes;

    public LocalAvatarStorage(Path root, String publicBaseUrl, long maxSizeBytes) {
        this.root = Objects.requireNonNull(root, "root");
        this.publicBaseUrl = normalizeBaseUrl(publicBaseUrl);
        this.maxSizeBytes = maxSizeBytes;
    }

    @Override
    public String store(UUID userId, MultipartFile file) throws IOException {
        if (userId == null) {
            throw new IllegalArgumentException("userId is required");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Avatar file is required.");
        }
        if (file.getSize() > maxSizeBytes) {
            throw new IllegalArgumentException("Avatar file exceeds the maximum allowed size of " + maxSizeBytes + " bytes.");
        }

        byte[] data = file.getBytes();
        if (data.length == 0) {
            throw new IllegalArgumentException("Avatar file is empty.");
        }
        if (data.length > maxSizeBytes) {
            throw new IllegalArgumentException("Avatar file exceeds the maximum allowed size of " + maxSizeBytes + " bytes.");
        }

        ImageType type = detectImageType(data);
        Path userDirectory = root.resolve(userId.toString());
        Files.createDirectories(userDirectory);
        clearDirectory(userDirectory);

        String fileName = "avatar." + type.extension;
        Path target = userDirectory.resolve(fileName);
        Files.write(target, data, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE);
        return publicBaseUrl + userId + "/" + fileName;
    }

    @Override
    public void delete(UUID userId) throws IOException {
        if (userId == null) {
            return;
        }
        Path userDirectory = root.resolve(userId.toString());
        if (!Files.exists(userDirectory)) {
            return;
        }
        clearDirectory(userDirectory);
        Files.deleteIfExists(userDirectory);
    }

    private ImageType detectImageType(byte[] data) {
        if (ImageType.PNG.matches(data)) {
            return ImageType.PNG;
        }
        if (ImageType.JPEG.matches(data)) {
            return ImageType.JPEG;
        }
        if (ImageType.WEBP.matches(data)) {
            return ImageType.WEBP;
        }
        throw new IllegalArgumentException("Unsupported avatar format. Only PNG, JPEG, or WebP images are allowed.");
    }

    private void clearDirectory(Path directory) throws IOException {
        if (!Files.exists(directory)) {
            return;
        }
        Files.walkFileTree(directory, new SimpleFileVisitor<>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                Files.deleteIfExists(file);
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                if (!dir.equals(directory)) {
                    Files.deleteIfExists(dir);
                }
                return FileVisitResult.CONTINUE;
            }
        });
    }

    private String normalizeBaseUrl(String value) {
        String candidate = StringUtils.hasText(value) ? value.trim() : "/static/avatars/";
        if (!candidate.startsWith("/")) {
            candidate = "/" + candidate;
        }
        if (!candidate.endsWith("/")) {
            candidate = candidate + "/";
        }
        return candidate;
    }

    private enum ImageType {
        PNG("png", new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}),
        JPEG("jpg", new byte[]{(byte) 0xFF, (byte) 0xD8}),
        WEBP("webp", new byte[]{0x52, 0x49, 0x46, 0x46});

        private final String extension;
        private final byte[] signature;

        ImageType(String extension, byte[] signature) {
            this.extension = extension;
            this.signature = signature;
        }

        boolean matches(byte[] data) {
            if (data.length < signature.length) {
                return false;
            }
            for (int i = 0; i < signature.length; i++) {
                if (data[i] != signature[i]) {
                    return false;
                }
            }
            if (this == WEBP) {
                return data.length >= 12
                        && data[8] == 0x57
                        && data[9] == 0x45
                        && data[10] == 0x42
                        && data[11] == 0x50;
            }
            if (this == JPEG) {
                return data.length >= 2
                        && data[0] == (byte) 0xFF
                        && data[1] == (byte) 0xD8
                        && data[data.length - 2] == (byte) 0xFF
                        && data[data.length - 1] == (byte) 0xD9;
            }
            return true;
        }
    }
}
