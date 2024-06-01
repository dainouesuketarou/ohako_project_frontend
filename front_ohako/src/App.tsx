import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import SearchResultsPage from './components/SearchResultsPage';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';
import './styles/App.css';

const App: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(true);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const openLoginModal = () => {
    setIsLoginOpen(true);
    setIsSignupOpen(false);
  };

  const openSignupModal = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const closeModals = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(false);
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<ProtectedRoute element={<HomePage />} />} />
          <Route path="/search" element={<ProtectedRoute element={<SearchResultsPage />} />} />
        </Routes>

        {isLoginOpen && (
          <AuthModal
            isLogin={true}
            closeModal={closeModals}
            toggleModal={openSignupModal}
          />
        )}
        {isSignupOpen && (
          <AuthModal
            isLogin={false}
            closeModal={closeModals}
            toggleModal={openLoginModal}
          />
        )}
      </div>
    </Router>
  );
};

export default App;