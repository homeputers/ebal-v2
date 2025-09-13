package com.homeputers.ebal2.api.song;

import com.homeputers.ebal2.api.arrangement.ArrangementMapper;
import com.homeputers.ebal2.api.domain.arrangement.Arrangement;
import com.homeputers.ebal2.api.domain.arrangement.ArrangementRepository;
import com.homeputers.ebal2.api.domain.song.Song;
import com.homeputers.ebal2.api.domain.song.SongRepository;
import com.homeputers.ebal2.api.generated.model.ArrangementRequest;
import com.homeputers.ebal2.api.generated.model.SongRequest;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class SongService {
    private final SongRepository songRepository;
    private final ArrangementRepository arrangementRepository;

    public SongService(SongRepository songRepository, ArrangementRepository arrangementRepository) {
        this.songRepository = songRepository;
        this.arrangementRepository = arrangementRepository;
    }

    public Song get(UUID id) {
        return songRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Song not found"));
    }

    public Page<Song> search(String title, String tag, Pageable pageable) {
        return songRepository.search(title, tag, pageable);
    }

    @Transactional
    public Song create(SongRequest request) {
        return songRepository.save(SongMapper.toEntity(request));
    }

    @Transactional
    public Song update(UUID id, SongRequest request) {
        Song existing = get(id);
        Song updated = new Song(
                existing.getId(),
                request.getTitle(),
                request.getCcli(),
                request.getAuthor(),
                request.getDefaultKey(),
                request.getTags()
        );
        return songRepository.save(updated);
    }

    @Transactional
    public void delete(UUID id) {
        songRepository.deleteById(id);
    }

    public List<Arrangement> listArrangements(UUID songId) {
        return arrangementRepository.findBySongId(songId);
    }

    @Transactional
    public Arrangement addArrangement(UUID songId, ArrangementRequest request) {
        Song song = get(songId);
        Arrangement arrangement = ArrangementMapper.toEntity(song, request);
        return arrangementRepository.save(arrangement);
    }

    @Transactional
    public Arrangement updateArrangement(UUID id, ArrangementRequest request) {
        Arrangement existing = arrangementRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Arrangement not found"));
        Arrangement updated = new Arrangement(
                existing.id(),
                existing.song(),
                request.getKey(),
                request.getBpm(),
                request.getMeter(),
                request.getLyricsChordpro()
        );
        return arrangementRepository.save(updated);
    }

    @Transactional
    public void deleteArrangement(UUID id) {
        arrangementRepository.deleteById(id);
    }
}
