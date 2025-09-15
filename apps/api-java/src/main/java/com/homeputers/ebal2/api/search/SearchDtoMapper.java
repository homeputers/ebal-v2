package com.homeputers.ebal2.api.search;

import com.homeputers.ebal2.api.generated.model.SearchResult;

public final class SearchDtoMapper {
    private SearchDtoMapper() {
    }

    public static SearchResult toResponse(SearchResultDto dto) {
        SearchResult res = new SearchResult();
        res.setKind(SearchResult.KindEnum.fromValue(dto.kind()));
        res.setId(dto.id());
        res.setTitle(dto.title());
        res.setSubtitle(dto.subtitle());
        return res;
    }
}

