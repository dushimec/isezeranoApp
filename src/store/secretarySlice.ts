
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface SecretaryState {
  dashboardData: any;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SecretaryState = {
  dashboardData: null,
  loading: 'idle',
  error: null,
};

export const fetchSecretaryDashboard = createAsyncThunk(
  'secretary/fetchDashboard',
  async (token: string) => {
    const response = await fetch('/api/secretary/dashboard', {
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

const secretarySlice = createSlice({
  name: 'secretary',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSecretaryDashboard.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchSecretaryDashboard.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = 'succeeded';
        state.dashboardData = action.payload;
      })
      .addCase(fetchSecretaryDashboard.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default secretarySlice.reducer;
