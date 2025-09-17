package com.homeputers.ebal2.api.storage;

import java.io.InputStream;
import java.time.Duration;

public interface StorageService {
    void put(String objectName, InputStream data, long size, String contentType);

    InputStream get(String objectName);

    String signedUrl(String objectName, Duration expiry);
}
