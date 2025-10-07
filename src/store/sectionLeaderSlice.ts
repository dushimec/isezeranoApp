
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Member {
  id: string;
  name: string;
  email: string;
}

interface SectionLeaderState {
  members: Member[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SectionLeaderState = {
  members: [],
  loading: 'idle',
  error: null,
};

export const fetchMembers = createAsyncThunk(
  'sectionLeader/fetchMembers',
  async (token: string) => {
    const response = await fetch('/api/section-leader/members', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch members');
    }
    const data: Member[] = await response.json();
    return data;
  }
);

const sectionLeaderSlice = createSlice({
  name: 'sectionLeader',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action: PayloadAction<Member[]>) => {
        state.loading = 'succeeded';
        state.members = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default sectionLeaderSlice.reducer;
