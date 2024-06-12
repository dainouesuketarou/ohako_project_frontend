import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import config from '../config';

interface Track {
  spotify_id: string;
  name: string;
  artists: string;
  album_name: string;
  album_image: string | null;
}

const TopBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Track[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 0) {
        setLoading(true);
        try {
          const response = await fetch(`${config.API_BASE_URL}/search/?query=${encodeURIComponent(query)}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error('Fetch suggestions error:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
          setShowSuggestions(true);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [query, token]);

  const handleSuggestionClick = (track: Track) => {
    setShowSuggestions(false);
    navigate(`/search?query=${encodeURIComponent(track.name)}`);
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  console.log("User Profile Image:", user?.profile_image); // 追加: 画像URLの確認

  return (
    <div className="top-bar">
      <div className="logo" onClick={() => navigate('/')}>
        <img
          src="/images/OHAKO_logo_1.png"
          alt="OHAKO ロゴ"
          className="ohako-logo"
          style={{ filter: "invert(1)" }}
        />
      </div>
      <div className="search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a track… 🔎"
          className="search-input"
        />
        {showSuggestions && (
          <div className="suggestions">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.name} - {suggestion.artists}
                </div>
              ))
            ) : (
              <div className="no-suggestions">No matching tracks found</div>
            )}
          </div>
        )}
      </div>
      <div className="profile-container" onClick={handleProfileClick}>
        <div className="profile-image-container">
          <img
            src={user?.profile_image ? `${config.API_BASE_URL}${user.profile_image}?${new Date().getTime()}` : "/images/default_profile.png"}
            alt="プロフィール画像"
            className={`profile-image ${!user?.profile_image ? "default-profile-image" : ""}`} // 条件に応じてクラスを適用
          />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
