package com.homeputers.ebal2.api;

import com.homeputers.ebal2.api.generated.HealthApi;
import com.homeputers.ebal2.api.generated.model.Health;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/v1")
public class HealthController implements HealthApi {

    @Override
    public ResponseEntity<Health> health() {
        Health health = new Health();
        health.setStatus("ok");
        return ResponseEntity.ok(health);
    }
}
