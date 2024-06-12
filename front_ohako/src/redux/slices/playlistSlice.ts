import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Track {
  spotify_id: string;
  name: string;
  artists: string;
  album_name: string;
  album_image: string | null;
}

interface PlaylistState {
  songs: Track[];
}

const initialState: PlaylistState = {
  songs: [],
};

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    setPlaylist: (state, action: PayloadAction<Track[]>) => {
      state.songs = action.payload;
    },
    addTrackToPlaylist: (state, action: PayloadAction<string>) => {
      // ここでAPIコールして、成功した場合のみstateを更新する処理を入れると良い
    },
    removeTrackFromPlaylist: (state, action: PayloadAction<string>) => {
      // ここでAPIコールして、成功した場合のみstateを更新する処理を入れると良い
    },
    followUser: (state, action: PayloadAction<number>) => {
      // ここでAPIコールして、成功した場合のみstateを更新する処理を入れると良い
    },
    unfollowUser: (state, action: PayloadAction<number>) => {
      // ここでAPIコールして、成功した場合のみstateを更新する処理を入れると良い
    },
  },
});

export const { setPlaylist, addTrackToPlaylist, removeTrackFromPlaylist, followUser, unfollowUser } = playlistSlice.actions;
export default playlistSlice.reducer;
