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
  },
});

export const { setPlaylist } = playlistSlice.actions;
export default playlistSlice.reducer;
