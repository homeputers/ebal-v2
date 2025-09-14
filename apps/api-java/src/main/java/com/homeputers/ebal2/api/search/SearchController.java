package com.homeputers.ebal2.api.search;

import com.homeputers.ebal2.api.generated.SearchApi;
import com.homeputers.ebal2.api.generated.model.SearchResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class SearchController implements SearchApi {
    private final SearchService service;

    public SearchController(SearchService service) {
        this.service = service;
    }

    @Override
    public ResponseEntity<List<SearchResult>> search(String q) {
        List<SearchResult> results = service.search(q).stream()
                .map(SearchDtoMapper::toResponse)
                .toList();
        return ResponseEntity.ok(results);
    }
}

