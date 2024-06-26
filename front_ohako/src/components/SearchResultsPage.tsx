import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/SearchResultsPage.css';
import config from '../config';

interface Track {
  spotify_id: string;
  name: string;
  artists: string;
  album_name: string;
  album_image: string | null;
}

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchResultsPage: React.FC = () => {
  const [results, setResults] = useState<Track[]>([]);
  const [trackInfo, setTrackInfo] = useState<Track | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [isTempoSearch, setIsTempoSearch] = useState<boolean>(false);
  const token = useSelector((state: RootState) => state.auth.token);
  const query = useQuery().get('query') || '';
  const navigate = useNavigate();

  const fetchPlaylist = useCallback(async () => {
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
          setPlaylist(trackIds);
        } else {
          console.error('Failed to fetch playlist');
        }
      } catch (error) {
        console.error('Error fetching playlist:', error);
      }
    }
  }, [token]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      if (token && query) {
        try {
          const searchEndpoint = isTempoSearch
            ? `${config.API_BASE_URL}/recommendations_by_tempo/?track_name=${query}`
            : `${config.API_BASE_URL}/recommendations/?track_name=${query}`;

          const response = await fetch(searchEndpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data && data.recommendations) {
              const mappedResults = data.recommendations.map((track: any) => ({
                spotify_id: track.id,
                name: track.name,
                artists: track.artists.join(', '),
                album_name: track.album_name,
                album_image: track.album_image,
              }));
              setResults(mappedResults);
              setTrackInfo({
                spotify_id: data.track_info.id,
                name: data.track_info.name,
                artists: data.track_info.artists.join(', '),
                album_name: data.track_info.album_name,
                album_image: data.track_info.album_image,
              });
            } else {
              console.error('Unexpected response format');
            }
          } else {
            console.error('Search failed');
          }
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSearchResults();
  }, [token, query, isTempoSearch]);

  useEffect(() => {
    fetchPlaylist();
  }, [fetchPlaylist]);

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
          setPlaylist([...playlist, track_id]);
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
          setPlaylist(playlist.filter(id => id !== track_id));
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

  const handleNavigateToTrackUsers = (spotify_id: string) => {
    navigate(`/track_users/${spotify_id}`);
  };

  return (
    <div>
      <video id="background-video" autoPlay loop muted>
        <source src="/videos/login_background_2.mov" type="video/mp4" />
      </video>
      <div className="search-results-page">
        <ToastContainer />
        {trackInfo && (
          <div className="search-results-header">
            <img src={trackInfo.album_image || ''} alt="Album cover" />
            <h1>{trackInfo.name} - {trackInfo.artists}</h1>
            {playlist.includes(trackInfo.spotify_id) ? (
              <button onClick={() => removeFromPlaylist(trackInfo.spotify_id)} className='minus-button2'>
                <img src="/images/GarbageCan.png" alt="Remove" style={{ width: '20px', height: '20px' }} />
              </button>
            ) : (
              <button onClick={() => addToPlaylist(trackInfo.spotify_id)} className='plus-button2'>+</button>
            )}
            <button onClick={() => handleNavigateToTrackUsers(trackInfo.spotify_id)} className='user-list-button3'>
              <img src="/images/search_user.png" alt="User List" style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        )}
        <button onClick={() => setIsTempoSearch(!isTempoSearch)} className='search-menu-button'>
          {isTempoSearch ? '⇔ キーで検索' : '⇔ テンポで検索'}
        </button>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="results">
            {results.length === 0 ? (
              <p>No results found.</p>
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
                  {results.map((result, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <img src={result.album_image || ''} alt={`${result.name} album cover`} />
                        <div>
                          <h3>{result.name}</h3>
                        </div>
                      </td>
                      <td>{result.artists}</td>
                      <td>{result.album_name}</td>
                      <td>
                        {playlist.includes(result.spotify_id) ? (
                          <button onClick={() => removeFromPlaylist(result.spotify_id)} className='minus-button'>
                            <img src="/images/GarbageCan.png" alt="Remove" style={{ width: '20px', height: '20px' }} />
                          </button>
                        ) : (
                          <button onClick={() => addToPlaylist(result.spotify_id)} className='plus-button'>+</button>
                        )}
                        <button onClick={() => handleNavigateToTrackUsers(result.spotify_id)} className='user-list-button'>
                          <img src="/images/search_user.png" alt="User List" style={{ width: '20px', height: '20px' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
