import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { updateUser } from '../redux/slices/authSlice';
import config from '../config';
import Modal from 'react-modal';
import './styles/UserProfile.css';
import { useNavigate } from 'react-router-dom';

const UserProfile: React.FC = () => {
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [following, setFollowing] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // useNavigateを使用してnavigate関数を定義

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setProfileImage(user.profile_image);
    }
  }, [user]);

  const fetchFollowData = useCallback(async () => {
    if (token) {
      try {
        const response = await fetch(`${config.API_BASE_URL}/follow_data/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFollowing(data.following);
          setFollowers(data.followers);
          setFollowersCount(data.followers_count);
          setFollowingCount(data.following_count);
        } else {
          console.error('Failed to fetch follow data');
        }
      } catch (error) {
        console.error('Error fetching follow data:', error);
      }
    }
  }, [token]);

  useEffect(() => {
    fetchFollowData();
  }, [fetchFollowData]);

  const handleProfileImageUpdate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (token && event.target.files && event.target.files[0]) {
      const formData = new FormData();
      formData.append('profile_image', event.target.files[0]);

      try {
        const response = await fetch(`${config.API_BASE_URL}/update_user/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const updatedUser = await response.json();
          dispatch(updateUser(updatedUser));
          setProfileImage(`${updatedUser.profile_image}?${new Date().getTime()}`); // Cache busting
        } else {
          console.error('Failed to update profile image');
        }
      } catch (error) {
        console.error('Error updating profile image:', error);
      }
    }
  };

  const handleUsernameChange = async () => {
    if (token) {
      try {
        const response = await fetch(`${config.API_BASE_URL}/update_user/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username: newUsername }),
        });
        if (response.ok) {
          const updatedUser = await response.json();
          dispatch(updateUser(updatedUser));
          setUsername(newUsername);
          setIsUsernameModalOpen(false);
        } else {
          console.error('Failed to update username');
        }
      } catch (error) {
        console.error('Error updating username:', error);
      }
    }
  };

  const navigateToUserPlaylist = (userId: number) => {
    navigate(`/user/${userId}/playlist`);
  };

  return (
    <div className="user-profile">
      <div className="profile-card">
        <div className="profile-section">
          <div className="profile-image-container">
            <img
              src={profileImage || '/images/default_profile.png'}
              alt="プロフィール画像"
              className="profile-image"
              onClick={() => document.getElementById('profile-image-input')?.click()}
            />
            <input
              type="file"
              id="profile-image-input"
              accept="image/*"
              onChange={handleProfileImageUpdate}
              className="profile-image-input"
            />
          </div>
          <div className="username-container">
            <h2>{username}</h2>
            <button onClick={() => setIsUsernameModalOpen(true)} className="edit-button">ユーザー名を変更</button>
          </div>
        </div>
        <div className="follow-data">
          <div onClick={() => setIsFollowersModalOpen(true)}>フォロワー数: {followersCount}</div>
          <div onClick={() => setIsFollowingModalOpen(true)}>フォロー中: {followingCount}</div>
        </div>
      </div>

      <Modal isOpen={isUsernameModalOpen} onRequestClose={() => setIsUsernameModalOpen(false)} className="user-profile-modal-content" overlayClassName="modal-overlay">
        <h2>ユーザー名を変更</h2>
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
        />
        <button onClick={handleUsernameChange} className='change-button'>変更</button>
        <button onClick={() => setIsUsernameModalOpen(false)}>キャンセル</button>
      </Modal>

      <Modal isOpen={isFollowingModalOpen} onRequestClose={() => setIsFollowingModalOpen(false)} className="user-profile-modal-content" overlayClassName="modal-overlay">
        <h2>フォローしているユーザー</h2>
        <div className="user-list">
          {following && following.map((user) => (
            <div key={user.id} className="user-list-item">
              <img src='/images/default_profile.png' alt={user.username} onClick={() => navigateToUserPlaylist(user.id)} />
              <span onClick={() => navigateToUserPlaylist(user.id)}>{user.username}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setIsFollowingModalOpen(false)}>閉じる</button>
      </Modal>

      <Modal isOpen={isFollowersModalOpen} onRequestClose={() => setIsFollowersModalOpen(false)} className="user-profile-modal-content" overlayClassName="modal-overlay">
        <h2>フォロワー</h2>
        <div className="user-list">
          {followers && followers.map((user) => (
            <div key={user.id} className="user-list-item">
              <img src='/images/default_profile.png' alt={user.username} onClick={() => navigateToUserPlaylist(user.id)} />
              <span onClick={() => navigateToUserPlaylist(user.id)}>{user.username}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setIsFollowersModalOpen(false)}>閉じる</button>
      </Modal>
    </div>
  );
};

export default UserProfile;
