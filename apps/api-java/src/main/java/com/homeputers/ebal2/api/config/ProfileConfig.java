package com.homeputers.ebal2.api.config;

import com.homeputers.ebal2.api.profile.storage.AvatarStorage;
import com.homeputers.ebal2.api.profile.storage.LocalAvatarStorage;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@EnableConfigurationProperties(SelfServiceProperties.class)
public class ProfileConfig implements WebMvcConfigurer {

    private final SelfServiceProperties properties;

    public ProfileConfig(SelfServiceProperties properties) {
        this.properties = properties;
    }

    @Bean
    public AvatarStorage avatarStorage() {
        Path storagePath = resolveStoragePath();
        try {
            Files.createDirectories(storagePath);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to initialize avatar storage", ex);
        }
        return new LocalAvatarStorage(storagePath, ensureTrailingSlash(properties.getAvatar().getPublicBaseUrl()),
                properties.getAvatar().getMaxSizeBytes());
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String baseUrl = ensureTrailingSlash(properties.getAvatar().getPublicBaseUrl());
        if (!baseUrl.startsWith("/")) {
            baseUrl = "/" + baseUrl;
        }
        String pattern = baseUrl + "**";
        String location = resolveStoragePath().toUri().toString();
        registry.addResourceHandler(pattern)
                .addResourceLocations(location.endsWith("/") ? location : location + "/");
    }

    private Path resolveStoragePath() {
        return Paths.get(properties.getAvatar().getStoragePath()).toAbsolutePath().normalize();
    }

    private String ensureTrailingSlash(String value) {
        if (value == null || value.isEmpty()) {
            return "/static/avatars/";
        }
        return value.endsWith("/") ? value : value + "/";
    }
}
