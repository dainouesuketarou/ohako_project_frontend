import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { setPlaylist } from '../redux/slices/playlistSlice';
import TopBar from './TopBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/HomePage.css';
import config from '../config';

interface Track {
  spotify_id: string;
  name: string;
  artists: string;
  album_name: string;
  album_image: string | null;
}

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const songs = useSelector((state: RootState) => state.playlist.songs) as Track[];
  const token = useSelector((state: RootState) => state.auth.token);

  const fetchPlaylist = useCallback(async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/playlists/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        dispatch(setPlaylist(data.tracks));
      } else {
        console.error('Failed to fetch playlist');
      }
    } catch (error) {
      console.error('Fetch playlist error:', error);
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (token) {
      fetchPlaylist();
    }
  }, [fetchPlaylist, token]);

  const removeFromPlaylist = async (track_id: string) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/remove_track/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ track_id }),
      });

      if (response.ok) {
        console.log('Track removed from playlist');
        fetchPlaylist();
        toast.success('プレイリストから削除しました');
      } else {
        console.error('Failed to remove track from playlist');
        toast.error('Failed to remove track from playlist');
      }
    } catch (error) {
      console.error('Error removing track from playlist:', error);
      toast.error('Error removing track from playlist');
    }
  };

  return (
    <div className="home-page">
      <TopBar />
      <ToastContainer />
      <h1 id="playlist-title">Your OHAKO</h1>
      <div className="playlist">
        {songs.length === 0 ? (
          <p>プレイリストに楽曲はありません</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>タイトル</th>
                <th>アーティスト</th>
                <th>アルバム</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((track, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <img src={track.album_image ?? ''} alt={`${track.name} album cover`} />
                    <div>
                      <h3>{track.name}</h3>
                    </div>
                  </td>
                  <td>{track.artists}</td>
                  <td>{track.album_name}</td>
                  <td>
                    <button onClick={() => removeFromPlaylist(track.spotify_id)}>-</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HomePage;