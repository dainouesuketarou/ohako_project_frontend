import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import './styles/FollowedUsers.css';
import config from '../config';

interface User {
  id: number;
  username: string;
  profile_image: string;
}

const FollowedUsers: React.FC = () => {
  const [followedUsers, setFollowedUsers] = useState<User[]>([]);
  const token = useSelector((state: RootState) => state.auth.token);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/followed_users/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFollowedUsers(data);
        } else {
          console.error('Failed to fetch followed users');
        }
      } catch (error) {
        console.error('Fetch followed users error:', error);
      }
    };

    fetchFollowedUsers();
  }, [token]);

  const handleUserClick = (userId: number) => {
    navigate(`/user_playlist/${userId}`);
  };

  return (
    <div className="followed-users">
      <h2>フォロー中のユーザー</h2>
      <div className="user-list">
        {followedUsers.map((user) => (
          <div key={user.id} className="user-item" onClick={() => handleUserClick(user.id)}>
            <img src={user.profile_image} alt={user.username} />
            <span>{user.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowedUsers;
