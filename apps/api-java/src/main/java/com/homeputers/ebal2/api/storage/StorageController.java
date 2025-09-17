package com.homeputers.ebal2.api.storage;

import com.homeputers.ebal2.api.generated.StorageApi;
import com.homeputers.ebal2.api.generated.model.StorageHealth;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@ConditionalOnProperty(prefix = "ebal.storage", name = "enabled", havingValue = "true")
public class StorageController implements StorageApi {
    private final StorageService storageService;

    public StorageController(StorageService storageService) {
        this.storageService = storageService;
    }

    @Override
    public ResponseEntity<StorageHealth> storageHealth() {
        StorageHealth health = new StorageHealth();
        health.setStatus(storageService != null ? "enabled" : "unavailable");
        return ResponseEntity.ok(health);
    }
}
