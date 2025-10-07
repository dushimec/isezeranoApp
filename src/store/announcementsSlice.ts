import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Announcement {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

interface AnnouncementsState {
  announcements: Announcement[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AnnouncementsState = {
  announcements: [],
  loading: 'idle',
  error: null,
};

export const fetchAnnouncements = createAsyncThunk(
  'announcements/fetchAnnouncements',
  async (token: string) => {
    const response = await fetch('/api/singer/announcements', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch announcements');
    }
    const data: Announcement[] = await response.json();
    return data;
  }
);

const announcementsSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action: PayloadAction<Announcement[]>) => {
        state.loading = 'succeeded';
        state.announcements = action.payload;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default announcementsSlice.reducer;
