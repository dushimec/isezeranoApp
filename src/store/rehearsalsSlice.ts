import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Rehearsal {
  id: number;
  date: string;
  time: string;
  location: string;
  isCancelled: boolean;
}

interface RehearsalsState {
  upcomingRehearsals: Rehearsal[];
  pastRehearsals: Rehearsal[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: RehearsalsState = {
  upcomingRehearsals: [],
  pastRehearsals: [],
  loading: 'idle',
  error: null,
};

export const fetchUpcomingRehearsals = createAsyncThunk(
  'rehearsals/fetchUpcomingRehearsals',
  async (token: string) => {
    const response = await fetch('/api/singer/rehearsals/upcoming', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch upcoming rehearsals');
    }
    const data: Rehearsal[] = await response.json();
    return data;
  }
);

export const fetchPastRehearsals = createAsyncThunk(
  'rehearsals/fetchPastRehearsals',
  async (token: string) => {
    const response = await fetch('/api/singer/rehearsals/past', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch past rehearsals');
    }
    const data: Rehearsal[] = await response.json();
    return data;
  }
);

const rehearsalsSlice = createSlice({
  name: 'rehearsals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpcomingRehearsals.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchUpcomingRehearsals.fulfilled, (state, action: PayloadAction<Rehearsal[]>) => {
        state.loading = 'succeeded';
        state.upcomingRehearsals = action.payload;
      })
      .addCase(fetchUpcomingRehearsals.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Something went wrong';
      })
      .addCase(fetchPastRehearsals.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchPastRehearsals.fulfilled, (state, action: PayloadAction<Rehearsal[]>) => {
        state.loading = 'succeeded';
        state.pastRehearsals = action.payload;
      })
      .addCase(fetchPastRehearsals.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default rehearsalsSlice.reducer;
