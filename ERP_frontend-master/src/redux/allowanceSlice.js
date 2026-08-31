import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import allowanceService from "../services/allowanceService";

export const fetchAllowances = createAsyncThunk(
  "allowance/fetch",
  async (employeeId, { rejectWithValue }) => {
    try {
      const data = await allowanceService.getAllowances(employeeId);
      return data.allowance; // assuming `allowance` is the array
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const allowanceSlice = createSlice({
  name: "allowance",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllowances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllowances.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllowances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
// hrmSlice.js
export const deleteAllowance = createAsyncThunk(
  'hrm/deleteAllowance',
  async (id) => {
    const response = await apiClient.delete(`/allowances/${id}`);
    return id; // Or response.data if your reducer needs full response
  }
);

export default allowanceSlice.reducer;
