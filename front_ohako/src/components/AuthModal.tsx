import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { login } from '../redux/slices/authSlice';
import './styles/Modal.css';
import config from '../config';

Modal.setAppElement('#root');

interface AuthModalProps {
  isLogin: boolean;
  closeModal: () => void;
  toggleModal: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isLogin, closeModal, toggleModal }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        dispatch(login(data.access));
        closeModal(); // モーダルを閉じる
        navigate('/'); // ホーム画面に遷移
      } else {
        setError('ユーザー名またはパスワードが間違っています。');
      }
    } catch (error) {
      setError('ログイン中にエラーが発生しました。');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.API_BASE_URL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        dispatch(login(data.access));
        closeModal(); // モーダルを閉じる
        navigate('/'); // ホーム画面に遷移
      } else {
        const errorData = await response.json();
        if (errorData.username) {
          setError('このユーザー名は既に使用されています。');
        } else {
          setError('サインアップに失敗しました。');
        }
      }
    } catch (error) {
      setError('サインアップ中にエラーが発生しました。');
    }
  };

  return (
    <>
      <div className="background-video-container">
        <video autoPlay loop muted className="background-video">
          <source src="/videos/login_background_1.mov" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <Modal
        isOpen={true}
        onRequestClose={closeModal}
        className="modal-content"
        overlayClassName="modal-overlay"
        shouldCloseOnOverlayClick={false}
      >
        <div className="modal-left">
          <p><img src="images/OHAKO_icon_1.png" alt="OHAKO ロゴ" style={{ width: "150px", height: "150px" }} /></p>
          <p>あなたに最適な歌を</p>
        </div>
        <div className="modal-right">
          {isLogin ? (
            <div>
              <h2>Login</h2>
              <form onSubmit={handleLoginSubmit}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <button type="submit">Login</button>
                {error && <p className="error">{error}</p>}
                <p>
                  <span onClick={toggleModal} className="link-text">
                    アカウントを持っていない方はこちら
                  </span>
                </p>
              </form>
            </div>
          ) : (
            <div>
              <h2>Sign Up</h2>
              <form onSubmit={handleSignupSubmit}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <button type="submit">Sign Up</button>
                {error && <p className="error">{error}</p>}
                <p>
                  <span onClick={toggleModal} className="link-text">
                    既にアカウントをお持ちですか？
                  </span>
                </p>
              </form>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default AuthModal;
