package com.homeputers.ebal2.api.storage;

import io.minio.GetObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.http.Method;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.InputStream;
import java.time.Duration;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

@Service
@ConditionalOnProperty(prefix = "ebal.storage", name = "enabled", havingValue = "true")
public class MinioStorageService implements StorageService {
    private static final Duration MAX_EXPIRY = Duration.ofDays(7);
    private final MinioClient minioClient;
    private final String bucketName;

    public MinioStorageService(
            @Value("${ebal.storage.endpoint}") String endpoint,
            @Value("${ebal.storage.access-key}") String accessKey,
            @Value("${ebal.storage.secret-key}") String secretKey,
            @Value("${ebal.storage.bucket}") String bucketName,
            @Value("${ebal.storage.region:}") String region
    ) {
        Objects.requireNonNull(endpoint, "Storage endpoint must be provided");
        Objects.requireNonNull(accessKey, "Storage access key must be provided");
        Objects.requireNonNull(secretKey, "Storage secret key must be provided");
        Objects.requireNonNull(bucketName, "Storage bucket must be provided");
        this.bucketName = bucketName;
        MinioClient.Builder builder = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey);
        if (StringUtils.hasText(region)) {
            builder.region(region);
        }
        this.minioClient = builder.build();
    }

    @Override
    public void put(String objectName, InputStream data, long size, String contentType) {
        Objects.requireNonNull(objectName, "Object name is required");
        Objects.requireNonNull(data, "Input stream is required");
        if (size < 0) {
            throw new IllegalArgumentException("Object size must be non-negative");
        }
        try {
            PutObjectArgs.Builder builder = PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .stream(data, size, -1);
            if (StringUtils.hasText(contentType)) {
                builder.contentType(contentType);
            }
            minioClient.putObject(builder.build());
        } catch (Exception ex) {
            throw new StorageException("Failed to upload object '%s'".formatted(objectName), ex);
        }
    }

    @Override
    public InputStream get(String objectName) {
        Objects.requireNonNull(objectName, "Object name is required");
        try {
            return minioClient.getObject(GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
        } catch (Exception ex) {
            throw new StorageException("Failed to download object '%s'".formatted(objectName), ex);
        }
    }

    @Override
    public String signedUrl(String objectName, Duration expiry) {
        Objects.requireNonNull(objectName, "Object name is required");
        Duration effectiveExpiry = expiry == null || expiry.isNegative() || expiry.isZero()
                ? Duration.ofMinutes(15)
                : expiry;
        if (effectiveExpiry.compareTo(MAX_EXPIRY) > 0) {
            effectiveExpiry = MAX_EXPIRY;
        }
        try {
            int expirySeconds = Math.toIntExact(effectiveExpiry.getSeconds());
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .method(Method.GET)
                    .expiry(expirySeconds, TimeUnit.SECONDS)
                    .build());
        } catch (Exception ex) {
            throw new StorageException("Failed to create signed URL for object '%s'".formatted(objectName), ex);
        }
    }
}
