import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { setIsLoginOpen } from '../redux/slices/uiSlice';

interface ProtectedRouteProps {
  element: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  if (!isAuthenticated) {
    dispatch(setIsLoginOpen(true)); // ログインモーダルを開く
    return <Navigate to="/" />;
  }

  return element;
};

export default ProtectedRoute;