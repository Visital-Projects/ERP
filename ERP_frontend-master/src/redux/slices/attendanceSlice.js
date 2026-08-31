 import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import attendanceService from '../../services/attendanceService'; // already created by you

// Thunks
export const fetchAttendance = createAsyncThunk('attendance/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await attendanceService.getAll(params);
    return res.data;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const markAttendance = createAsyncThunk('attendance/mark', async (payload, { rejectWithValue }) => {
  try {
    const res = await attendanceService.create(payload);
    return res.data;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

// Initial state
const initialState = {
  attendances: [],
  loading: false,
  error: null,
};

// Slice
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances = action.payload || [];
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(markAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances.unshift(action.payload);
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearAttendanceError } = attendanceSlice.actions;

export const selectAttendance = (state) => state.attendance.attendances;
export const selectAttendanceLoading = (state) => state.attendance.loading;
export const selectAttendanceError = (state) => state.attendance.error;

export default attendanceSlice.reducer;
