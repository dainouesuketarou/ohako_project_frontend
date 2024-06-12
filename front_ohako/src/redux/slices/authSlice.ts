import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  username: string;
  profile_image: string | null;
  token: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string, user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    loadToken: (state) => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) {
        state.token = token;
        state.user = JSON.parse(user);
        state.isAuthenticated = true;
      }
    },
    updateUser: (state, action: PayloadAction<FormData>) => {
      if (state.user) {
        state.user.username = action.payload.get('username') as string;
        const profileImage = action.payload.get('profile_image');
        if (profileImage) {
          state.user.profile_image = profileImage as string;
        }
      }
    },
  },
});

export const { login, logout, loadToken, updateUser } = authSlice.actions;
export default authSlice.reducer;