package com.homeputers.ebal2.api.storage;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import static org.assertj.core.api.Assertions.assertThat;

class StorageFeatureFlagTest {
    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(StorageComponentConfig.class);

    @Test
    void storageBeansAreDisabledByDefault() {
        contextRunner.run(context -> {
            assertThat(context).doesNotHaveBean(StorageService.class);
            assertThat(context).doesNotHaveBean(StorageController.class);
        });
    }

    @Test
    void storageBeansLoadWhenFeatureFlagEnabled() {
        contextRunner.withPropertyValues(
                        "ebal.storage.enabled=true",
                        "ebal.storage.endpoint=http://localhost:9000",
                        "ebal.storage.access-key=test",
                        "ebal.storage.secret-key=test",
                        "ebal.storage.bucket=attachments"
                )
                .run(context -> {
                    assertThat(context).hasSingleBean(StorageService.class);
                    assertThat(context).hasSingleBean(StorageController.class);
                });
    }

    @Configuration(proxyBeanMethods = false)
    @ComponentScan(basePackageClasses = MinioStorageService.class)
    static class StorageComponentConfig {
    }
}
