import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isLoginOpen: boolean;
}

const initialState: UiState = {
  isLoginOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setIsLoginOpen(state, action: PayloadAction<boolean>) {
      state.isLoginOpen = action.payload;
    },
  },
});

export const { setIsLoginOpen } = uiSlice.actions;
export default uiSlice.reducer;
