package com.homeputers.ebal2.api.song;

import com.homeputers.ebal2.api.arrangement.ArrangementDtoMapper;
import com.homeputers.ebal2.api.domain.arrangement.Arrangement;
import com.homeputers.ebal2.api.domain.arrangement.ArrangementMapper;
import com.homeputers.ebal2.api.domain.song.Song;
import com.homeputers.ebal2.api.domain.song.SongMapper;
import com.homeputers.ebal2.api.generated.model.ArrangementRequest;
import com.homeputers.ebal2.api.generated.model.SongRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class SongService {
    private final SongMapper songMapper;
    private final ArrangementMapper arrangementMapper;

    public SongService(SongMapper songMapper, ArrangementMapper arrangementMapper) {
        this.songMapper = songMapper;
        this.arrangementMapper = arrangementMapper;
    }

    public Song get(UUID id) {
        Song song = songMapper.findById(id);
        if (song == null) {
            throw new NoSuchElementException("Song not found");
        }
        return song;
    }

    public Page<Song> search(String title, String tag, Pageable pageable) {
        int offset = (int) pageable.getOffset();
        int limit = pageable.getPageSize();
        var results = songMapper.search(title, tag, offset, limit);
        int total = songMapper.countSearch(title, tag);
        return new PageImpl<>(results, pageable, total);
    }

    @Transactional
    public Song create(SongRequest request) {
        Song song = SongDtoMapper.toEntity(request);
        songMapper.insert(
            song.id(),
            song.title(),
            song.ccli(),
            song.author(),
            song.defaultKey(),
            song.tags()
        );
        return song;
    }

    @Transactional
    public Song update(UUID id, SongRequest request) {
        Song existing = get(id);
        Song updated = new Song(
                existing.id(),
                request.getTitle(),
                request.getCcli(),
                request.getAuthor(),
                request.getDefaultKey(),
                request.getTags()
        );
        songMapper.update(
            id,
            request.getTitle(),
            request.getCcli(),
            request.getAuthor(),
            request.getDefaultKey(),
            request.getTags()
        );
        return updated;
    }

    @Transactional
    public void delete(UUID id) {
        songMapper.delete(id);
    }

    public Arrangement getArrangement(UUID id) {
        Arrangement arrangement = arrangementMapper.findById(id);
        if (arrangement == null) {
            throw new NoSuchElementException("Arrangement not found");
        }
        return arrangement;
    }

    public List<Arrangement> listArrangements(UUID songId) {
        return arrangementMapper.findBySongId(songId);
    }

    @Transactional
    public Arrangement addArrangement(UUID songId, ArrangementRequest request) {
        Song song = get(songId);
        Arrangement arrangement = ArrangementDtoMapper.toEntity(song, request);
        arrangementMapper.insert(
            arrangement.id(),
            songId,
            arrangement.key(),
            arrangement.bpm(),
            arrangement.meter(),
            arrangement.lyricsChordpro()
        );
        return arrangement;
    }

    @Transactional
    public Arrangement updateArrangement(UUID id, ArrangementRequest request) {
        Arrangement existing = arrangementMapper.findById(id);
        if (existing == null) {
            throw new NoSuchElementException("Arrangement not found");
        }
        Arrangement updated = new Arrangement(
                existing.id(),
                existing.song(),
                request.getKey(),
                request.getBpm(),
                request.getMeter(),
                request.getLyricsChordpro()
        );
        arrangementMapper.update(
            id,
            request.getKey(),
            request.getBpm(),
            request.getMeter(),
            request.getLyricsChordpro()
        );
        return updated;
    }

    @Transactional
    public void deleteArrangement(UUID id) {
        arrangementMapper.delete(id);
    }
}
