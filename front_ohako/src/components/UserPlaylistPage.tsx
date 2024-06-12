import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../config';
import './styles/UserPlaylistPage.css';

interface Track {
  spotify_id: string;
  name: string;
  artists: string;
  album_name: string;
  album_image: string | null;
}

interface Playlist {
  id: number;
  name: string;
  tracks: Track[];
}

const UserPlaylistPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userPlaylist, setUserPlaylist] = useState<string[]>([]);
  const token = useSelector((state: RootState) => state.auth.token);
  const navigate = useNavigate(); // navigate を宣言

  useEffect(() => {
    const fetchUserPlaylist = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${config.API_BASE_URL}/user_playlist/${userId}/`);
        if (response.ok) {
          const data = await response.json();
          setPlaylist(data);
        } else {
          console.error('Failed to fetch user playlist');
        }
      } catch (error) {
        console.error('Error fetching user playlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlaylist();
  }, [userId]);

  const fetchOwnPlaylist = useCallback(async () => {
    if (token) {
      try {
        const response = await fetch(`${config.API_BASE_URL}/playlists/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const trackIds = data.tracks.map((track: any) => track.spotify_id);
          setUserPlaylist(trackIds);
        } else {
          console.error('Failed to fetch playlist');
        }
      } catch (error) {
        console.error('Error fetching playlist:', error);
      }
    }
  }, [token]);

  useEffect(() => {
    fetchOwnPlaylist();
  }, [fetchOwnPlaylist]);

  const addToPlaylist = async (track_id: string) => {
    if (token) {
      try {
        const response = await fetch(`${config.API_BASE_URL}/add_track/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ track_id }),
        });

        if (response.ok) {
          console.log('Track added to playlist');
          setUserPlaylist([...userPlaylist, track_id]);
          toast.success('プレイリストに追加しました');
        } else {
          console.error('Failed to add track to playlist');
          toast.error('Failed to add track to playlist');
        }
      } catch (error) {
        console.error('Error adding track to playlist:', error);
        toast.error('Error adding track to playlist');
      }
    }
  };

  const removeFromPlaylist = async (track_id: string) => {
    if (token) {
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
          setUserPlaylist(userPlaylist.filter(id => id !== track_id));
          toast.success('プレイリストから削除しました');
        } else {
          console.error('Failed to remove track from playlist');
          toast.error('Failed to remove track from playlist');
        }
      } catch (error) {
        console.error('Error removing track from playlist:', error);
        toast.error('Error removing track from playlist');
      }
    }
  };

  return (
    <div className="user-playlist-page">
      <video id="background-video" autoPlay loop muted>
        <source src="/videos/login_background_2.mov" type="video/mp4" />
      </video>
      <ToastContainer />
      {loading ? (
        <p>Loading...</p>
      ) : (
        playlist && (
          <div>
            <h1>{playlist.name}</h1>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>タイトル</th>
                  <th>アーティスト</th>
                  <th>アルバム</th>
                  <th>操作</th>
                  <th>ユーザー</th>
                </tr>
              </thead>
              <tbody>
                {playlist.tracks.map((track, index) => (
                  <tr key={track.spotify_id}>
                    <td>{index + 1}</td>
                    <td>
                      <img src={track.album_image || ''} alt={`${track.name} album cover`} />
                      <div>
                        <h3>{track.name}</h3>
                      </div>
                    </td>
                    <td>{track.artists}</td>
                    <td>{track.album_name}</td>
                    <td>
                      {userPlaylist.includes(track.spotify_id) ? (
                        <button onClick={() => removeFromPlaylist(track.spotify_id)} className='minus-button'>
                          <img src="/images/GarbageCan.png" alt="Remove" style={{ width: '20px', height: '20px' }} />
                        </button>
                      ) : (
                        <button onClick={() => addToPlaylist(track.spotify_id)} className='plus-button'>+</button>
                      )}
                    </td>
                    <td>
                      <button onClick={() => navigate(`/track_users/${track.spotify_id}`)} className="user-list-button">
                        ユーザー一覧
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default UserPlaylistPage;