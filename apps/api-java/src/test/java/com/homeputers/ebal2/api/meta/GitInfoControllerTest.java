package com.homeputers.ebal2.api.meta;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.GitProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.Properties;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = GitInfoController.class)
@AutoConfigureMockMvc(addFilters = false)
class GitInfoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void returnsGitMetadataFromConfiguredProperties() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/v1/meta/git"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.branch").value("test-branch"))
                .andExpect(jsonPath("$.commitId").value("0123456789abcdef0123456789abcdef01234567"))
                .andExpect(jsonPath("$.abbreviatedCommitId").value("0123456"))
                .andExpect(jsonPath("$.commitTime").value("2024-01-15T12:34:56Z"))
                .andExpect(jsonPath("$.dirty").value(true))
                .andExpect(jsonPath("$.tags[0]").value("v1.0.0"))
                .andExpect(jsonPath("$.tags[1]").value("latest"))
                .andExpect(jsonPath("$.closestTag").value("v1.0.0"))
                .andExpect(jsonPath("$.describe").value("v1.0.0-1-g0123456"));
    }

    @TestConfiguration
    static class GitPropertiesTestConfiguration {
        @Bean
        GitProperties gitProperties() {
            Properties properties = new Properties();
            properties.put("branch", "test-branch");
            properties.put("commit.id", "0123456789abcdef0123456789abcdef01234567");
            properties.put("commit.id.abbrev", "0123456");
            properties.put("commit.time", "2024-01-15T12:34:56Z");
            properties.put("dirty", "true");
            properties.put("tags", "v1.0.0,latest");
            properties.put("closest.tag.name", "v1.0.0");
            properties.put("commit.id.describe", "v1.0.0-1-g0123456");
            return new GitProperties(properties);
        }
    }
}
