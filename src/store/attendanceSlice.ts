import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Attendance {
  id: number;
  rehearsalId: number;
  serviceId: number;
  status: string;
  createdAt: string;
}

interface AttendanceState {
  attendance: Attendance[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AttendanceState = {
  attendance: [],
  loading: 'idle',
  error: null,
};

export const fetchAttendance = createAsyncThunk(
  'attendance/fetchAttendance',
  async (token: string) => {
    const response = await fetch('/api/singer/attendance', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch attendance');
    }
    const data: Attendance[] = await response.json();
    return data;
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action: PayloadAction<Attendance[]>) => {
        state.loading = 'succeeded';
        state.attendance = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default attendanceSlice.reducer;
