import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  username: string;
  profile_image: string | null;
  token: string;  // この行を追加
}

interface UserState {
  following: User[];
}

const initialState: UserState = {
  following: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setFollowing: (state, action: PayloadAction<User[]>) => {
      state.following = action.payload;
    },
    followUser: (state, action: PayloadAction<User>) => {
      state.following.push(action.payload);
    },
    unfollowUser: (state, action: PayloadAction<number>) => {
      state.following = state.following.filter(user => user.id !== action.payload);
    },
  },
});

export const { setFollowing, followUser, unfollowUser } = userSlice.actions;
export default userSlice.reducer;
