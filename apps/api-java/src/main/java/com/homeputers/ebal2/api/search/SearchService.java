package com.homeputers.ebal2.api.search;

import com.homeputers.ebal2.api.domain.member.Member;
import com.homeputers.ebal2.api.domain.member.MemberMapper;
import com.homeputers.ebal2.api.domain.song.Song;
import com.homeputers.ebal2.api.domain.song.SongMapper;
import com.homeputers.ebal2.api.domain.service.Service;
import com.homeputers.ebal2.api.domain.service.ServiceMapper;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SearchService {
    private static final int MEMBER_LIMIT = 5;
    private static final int SONG_LIMIT = 5;
    private static final int SERVICE_LIMIT = 5;

    private final MemberMapper memberMapper;
    private final SongMapper songMapper;
    private final ServiceMapper serviceMapper;

    public SearchService(MemberMapper memberMapper,
                         SongMapper songMapper,
                         ServiceMapper serviceMapper) {
        this.memberMapper = memberMapper;
        this.songMapper = songMapper;
        this.serviceMapper = serviceMapper;
    }

    public List<SearchResultDto> search(String query) {
        List<SearchResultDto> results = new ArrayList<>();

        List<Member> members = memberMapper.search(query, MEMBER_LIMIT);
        for (Member m : members) {
            String subtitle = m.instruments() == null ? null : String.join(", ", m.instruments());
            results.add(new SearchResultDto("member", m.id(), m.displayName(), subtitle));
        }

        List<Song> songs = songMapper.search(query, null, 0, SONG_LIMIT);
        for (Song s : songs) {
            results.add(new SearchResultDto("song", s.id(), s.title(), s.author()));
        }

        OffsetDateTime now = OffsetDateTime.now();
        List<Service> services = serviceMapper.search(query, now.minusMonths(6), now.plusMonths(6), SERVICE_LIMIT);
        for (Service svc : services) {
            String title = svc.startsAt().toString();
            results.add(new SearchResultDto("service", svc.id(), title, svc.location()));
        }

        return results;
    }
}

