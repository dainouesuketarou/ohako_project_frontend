import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import playlistReducer from './slices/playlistSlice';
import uiReducer from './slices/uiSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    playlist: playlistReducer,
    ui: uiReducer,
    user: userReducer,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
