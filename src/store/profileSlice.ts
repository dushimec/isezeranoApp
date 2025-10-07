import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User {
    id: number;
    fullName: string;
    phoneNumber: string;
    role: string;
}

interface ProfileState {
  user: User | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProfileState = {
  user: null,
  loading: 'idle',
  error: null,
};

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (token: string) => {
    const response = await fetch('/api/singer/profile', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
    }
    const data: User = await response.json();
    return data;
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async ({ token, fullName, phoneNumber }: { token: string, fullName: string, phoneNumber: string }) => {
    const response = await fetch('/api/singer/profile', {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, phoneNumber }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
    }
    const data: User = await response.json();
    return data;
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Something went wrong';
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = 'succeeded';
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default profileSlice.reducer;
