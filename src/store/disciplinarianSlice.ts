import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  fullName: string;
  role: string;
}

interface AttendanceRecord {
  id: number;
  status: string;
  user_name: string;
  event_type: string;
  event_date: string;
}

interface DisciplinarianState {
  users: User[];
  attendance: AttendanceRecord[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DisciplinarianState = {
  users: [],
  attendance: [],
  loading: 'idle',
  error: null,
};

export const fetchAllUsers = createAsyncThunk(
  'disciplinarian/fetchAllUsers',
  async (token: string) => {
    const response = await fetch('/api/disciplinarian/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch users');
    }
    const data: User[] = await response.json();
    return data;
  }
);

export const fetchAllAttendance = createAsyncThunk(
  'disciplinarian/fetchAllAttendance',
  async (token: string) => {
    const response = await fetch('/api/disciplinarian/attendance', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch attendance records');
    }
    const data: AttendanceRecord[] = await response.json();
    return data;
  }
);

const disciplinarianSlice = createSlice({
  name: 'disciplinarian',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Something went wrong';
      })
      .addCase(fetchAllAttendance.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchAllAttendance.fulfilled, (state, action: PayloadAction<AttendanceRecord[]>) => {
        state.loading = 'succeeded';
        state.attendance = action.payload;
      })
      .addCase(fetchAllAttendance.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default disciplinarianSlice.reducer;
