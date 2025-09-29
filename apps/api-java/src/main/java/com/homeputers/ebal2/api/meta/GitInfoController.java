package com.homeputers.ebal2.api.meta;

import com.homeputers.ebal2.api.generated.MetaApi;
import com.homeputers.ebal2.api.generated.model.GitInfo;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.info.GitProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
public class GitInfoController implements MetaApi {

    private final ObjectProvider<GitProperties> gitPropertiesProvider;

    public GitInfoController(ObjectProvider<GitProperties> gitPropertiesProvider) {
        this.gitPropertiesProvider = gitPropertiesProvider;
    }

    @Override
    public ResponseEntity<GitInfo> getGitInformation() {
        GitInfo response = new GitInfo();
        gitPropertiesProvider.ifAvailable(properties -> populateResponse(response, properties));
        return ResponseEntity.ok(response);
    }

    private void populateResponse(GitInfo response, GitProperties properties) {
        response.setBranch(nullIfBlank(properties.getBranch()));
        response.setCommitId(nullIfBlank(properties.getCommitId()));
        response.setAbbreviatedCommitId(nullIfBlank(properties.getShortCommitId()));

        String commitTime = properties.get("commit.time");
        if (StringUtils.hasText(commitTime)) {
            try {
                response.setCommitTime(OffsetDateTime.parse(commitTime));
            } catch (DateTimeParseException ignored) {
                // ignore invalid format
            }
        }

        String dirty = properties.get("dirty");
        if (StringUtils.hasText(dirty)) {
            response.setDirty(Boolean.parseBoolean(dirty));
        }

        String tags = properties.get("tags");
        if (StringUtils.hasText(tags)) {
            List<String> tagList = Arrays.stream(tags.split(","))
                    .map(String::trim)
                    .filter(StringUtils::hasText)
                    .collect(Collectors.toList());
            if (!tagList.isEmpty()) {
                response.setTags(tagList);
            }
        }

        String closestTag = properties.get("closest.tag.name");
        if (StringUtils.hasText(closestTag)) {
            response.setClosestTag(closestTag);
        }

        String describe = firstNonBlank(properties.get("commit.id.describe"),
                properties.get("commit.id.describe-short"));
        if (StringUtils.hasText(describe)) {
            response.setDescribe(describe);
        }
    }

    private String nullIfBlank(String value) {
        return StringUtils.hasText(value) ? value : null;
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return null;
    }
}
