package com.homeputers.ebal2.api.profile.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

public interface AvatarStorage {

    String store(UUID userId, MultipartFile file) throws IOException;

    void delete(UUID userId) throws IOException;
}
