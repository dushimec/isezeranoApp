import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Service {
    id: number;
    date: string;
    churchName: string;
    churchLocation: string;
    isCancelled: boolean;
}

interface ServicesState {
  upcomingServices: Service[];
  pastServices: Service[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ServicesState = {
  upcomingServices: [],
  pastServices: [],
  loading: 'idle',
  error: null,
};

export const fetchUpcomingServices = createAsyncThunk(
  'services/fetchUpcomingServices',
  async (token: string) => {
    const response = await fetch('/api/singer/services/upcoming', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch upcoming services');
    }
    const data: Service[] = await response.json();
    return data;
  }
);

export const fetchPastServices = createAsyncThunk(
  'services/fetchPastServices',
  async (token: string) => {
    const response = await fetch('/api/singer/services/past', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch past services');
    }
    const data: Service[] = await response.json();
    return data;
  }
);

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpcomingServices.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchUpcomingServices.fulfilled, (state, action: PayloadAction<Service[]>) => {
        state.loading = 'succeeded';
        state.upcomingServices = action.payload;
      })
      .addCase(fetchUpcomingServices.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Something went wrong';
      })
      .addCase(fetchPastServices.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchPastServices.fulfilled, (state, action: PayloadAction<Service[]>) => {
        state.loading = 'succeeded';
        state.pastServices = action.payload;
      })
      .addCase(fetchPastServices.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default servicesSlice.reducer;
