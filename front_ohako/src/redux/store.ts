import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import playlistReducer from './slices/playlistSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    playlist: playlistReducer,
    ui: uiReducer,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
