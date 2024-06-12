import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import config from '../config';
import './styles/TrackUsersPage.css';

interface User {
  id: number;
  username: string;
  profile_image: string | null;
  is_following: boolean;
}

const TrackUsersPage: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const [users, setUsers] = useState<User[]>([]);
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (token) {
        try {
          const response = await fetch(`${config.API_BASE_URL}/track_users/${trackId}/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUsers(data.filter((user: User) => user.id !== currentUser?.id)); // 自分自身を除外
          } else {
            console.error('Failed to fetch users');
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      }
    };

    fetchUsers();
  }, [token, trackId, currentUser]);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (token && users.length > 0) {
        try {
          const response = await fetch(`${config.API_BASE_URL}/follow_status/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ user_ids: users.map(user => user.id) }),
          });
          if (response.ok) {
            const data = await response.json();
            setUsers(users.map(user => ({
              ...user,
              is_following: data.following.includes(user.id),
            })));
          } else {
            console.error('Failed to fetch follow status');
          }
        } catch (error) {
          console.error('Error fetching follow status:', error);
        }
      }
    };

    fetchFollowStatus();
  }, [token, users.map(user => user.id).join(',')]); // users.map(user => user.id).join(',')で依存関係を簡潔にする

  const handleFollow = async (userId: number) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/follow_user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        setUsers(users.map(user => (user.id === userId ? { ...user, is_following: true } : user)));
      } else {
        console.error('Failed to follow user');
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/unfollow_user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        setUsers(users.map(user => (user.id === userId ? { ...user, is_following: false } : user)));
      } else {
        console.error('Failed to unfollow user');
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const navigateToUserPlaylist = (userId: number) => {
    navigate(`/user/${userId}/playlist`);
  };

  return (
    <div className="track-users-page">
      <h1>プレイリストに追加したユーザー</h1>
      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-item">
            <div className="profile-image-container">
              <img
                src={user.profile_image ? `${config.API_BASE_URL}${user.profile_image}` : "/images/default_profile.png"}
                alt={user.username}
                onClick={() => navigateToUserPlaylist(user.id)}
                className="profile-image"
              />
            </div>
            <span onClick={() => navigateToUserPlaylist(user.id)}>{user.username}</span>
            {user.is_following ? (
              <button onClick={() => handleUnfollow(user.id)}>アンフォロー</button>
            ) : (
              <button onClick={() => handleFollow(user.id)}>フォロー</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackUsersPage;
