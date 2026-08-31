

// src/redux/slices/salarySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../services/apiClient";

export const fetchEmployeeSalary = createAsyncThunk(
  "salary/fetch",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/set-salary/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateEmployeeSalary = createAsyncThunk(
  "salary/update",
  async ({ employeeId, data }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/set-salary/${employeeId}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const salarySlice = createSlice({
  name: "salary",
  initialState: {
    employee: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeSalary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeSalary.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload.employee;
      })
      .addCase(fetchEmployeeSalary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateEmployeeSalary.fulfilled, (state, action) => {
        state.employee = action.payload.employee;
      });
  },
});

export default salarySlice.reducer;
