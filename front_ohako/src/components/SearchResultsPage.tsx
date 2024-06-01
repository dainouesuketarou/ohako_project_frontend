import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import TopBar from './TopBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/SearchResultsPage.css'; // 新しいスタイルシートをインポート
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
  const [loading, setLoading] = useState<boolean>(true);
  const [playlist, setPlaylist] = useState<string[]>([]); // 追加された楽曲のSpotify IDリスト
  const token = useSelector((state: RootState) => state.auth.token);
  const query = useQuery().get('query') || '';

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
          const response = await fetch(`${config.API_BASE_URL}/recommendations/?track_name=${query}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            console.log("Search Results:", data); // デバッグ用にデータを出力
            // フィールド名をマッピング
            const mappedResults = data.map((track: any) => ({
              spotify_id: track.id,
              name: track.name,
              artists: track.artists.join(', '),
              album_name: track.album_name,
              album_image: track.album_image,
            }));
            setResults(mappedResults);
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
  }, [token, query]);

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

  return (
    <div className="search-results-page">
      <TopBar />
      <ToastContainer />
      <h1>"{query}"と同じぐらいのキーの曲</h1>
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
                      <img src={result.album_image ?? ''} alt={`${result.name} album cover`} />
                      <div>
                        <h3>{result.name}</h3>
                      </div>
                    </td>
                    <td>{result.artists}</td>
                    <td>{result.album_name}</td>
                    <td>
                      {playlist.includes(result.spotify_id) ? (
                        <button onClick={() => removeFromPlaylist(result.spotify_id)} className='minus-button'>-</button>
                      ) : (
                        <button onClick={() => addToPlaylist(result.spotify_id)} className='plus-button'>+</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;