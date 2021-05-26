package com.songify.api.service.impl;

import com.songify.api.exceptions.ResourceNotFoundException;
import com.songify.api.model.Playlist;
import com.songify.api.model.Song;
import com.songify.api.model.dto.NewPlaylistRequest;
import com.songify.api.repository.PlaylistRepository;
import com.songify.api.repository.SongRepository;
import com.songify.api.service.PlaylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaylistServiceImpl implements PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final SongRepository songRepository;

    @Override
    public List<Playlist> getPlaylists(){
        return this.playlistRepository.findAll();
    }

    @Override
    public Playlist getPlaylistById(Long id) {
        return this.playlistRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Playlist not found with id"));
    }

    @Override
    public List<Playlist> getPlaylistsByUsername(String username){
        return this.playlistRepository.getPlaylistByCreatedBy(username);
    }

    @Override
    public Playlist addPlaylist(NewPlaylistRequest newPlaylist) {
        var playlist = new Playlist();

        // CHOSEN VALUES
        playlist.setTitle(newPlaylist.getTitle());
        playlist.setDescription(newPlaylist.getDesc());
        // NEW PLAYLIST AUTOMATIC VALUES
        playlist.setPlays(0);
        playlist.setSongs(new ArrayList<>());
        // AUDITABLE VALUES
        playlist.setCreatedBy(newPlaylist.getUsername());
        playlist.setLastModifiedBy(newPlaylist.getUsername());

        return this.playlistRepository.save(playlist);
    }

    @Override //returns the 8 more popular playlists as a 'page'
    public Page<Playlist> getPopularPlaylists() { return this.playlistRepository.findAll(PageRequest.of(0,8, Sort.by(Sort.Direction.DESC, "Plays"))); }

    @Override
    public Song addSongToPlaylist(Long playlistId, Long songId){
        //determine song based on given id
        var song = songRepository.findById(songId).orElseThrow(()-> new ResourceNotFoundException("Adding song to playlist, song not found"));
        //determine playlist based on given id
        var playlist = playlistRepository.findById(playlistId).orElseThrow(() -> new ResourceNotFoundException("playlist not found during add song"));

        playlist.addSong(song);
        playlistRepository.save(playlist);

        //return the added song
        return song;

    }
}
