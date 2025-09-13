package com.homeputers.ebal2.api;

import com.homeputers.ebal2.api.generated.SystemApi;
import com.homeputers.ebal2.api.generated.model.Health;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController implements SystemApi {

    @Override
    public ResponseEntity<Health> health() {
        Health health = new Health();
        health.setStatus("ok");
        return ResponseEntity.ok(health);
    }
}
