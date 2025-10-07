
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminState {
  users: User[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  loading: 'idle',
  error: null,
};

export const fetchUsers = createAsyncThunk('admin/fetchUsers', async (token: string) => {
  const response = await fetch('/api/admin/users', {
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
});

export const registerUser = createAsyncThunk('admin/registerUser', async ({ token, userData }: { token: string; userData: any }) => {
  const response = await fetch('/api/admin/register', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to register user');
  }
  const data: User = await response.json();
  return data;
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Something went wrong';
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = 'succeeded';
        state.users.push(action.payload);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default adminSlice.reducer;
