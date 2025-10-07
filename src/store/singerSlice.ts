
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface SingerState {
  dashboardData: any;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SingerState = {
  dashboardData: null,
  loading: 'idle',
  error: null,
};

export const fetchSingerDashboard = createAsyncThunk(
  'singer/fetchDashboard',
  async (token: string) => {
    const response = await fetch('/api/singer/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch dashboard data');
    }
    const data: any = await response.json();
    return data;
  }
);

const singerSlice = createSlice({
  name: 'singer',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSingerDashboard.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchSingerDashboard.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = 'succeeded';
        state.dashboardData = action.payload;
      })
      .addCase(fetchSingerDashboard.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default singerSlice.reducer;
