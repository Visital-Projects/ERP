import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  exportPayrollExcel,
} from '../../services/hrmService';

export const fetchEmployees = createAsyncThunk('hrm/fetchEmployees', async (_, { rejectWithValue }) => {
  try { return await getEmployees(); }
  catch (e) { return rejectWithValue(e.response?.data || e.message); }
});

export const fetchEmployee = createAsyncThunk('hrm/fetchEmployee', async (id, { rejectWithValue }) => {
  try { return await getEmployeeById(id); }
  catch (e) { return rejectWithValue(e.response?.data || e.message); }
});

export const addEmployee = createAsyncThunk('hrm/addEmployee', async (payload, { rejectWithValue }) => {
  try { return await createEmployee(payload); }
  catch (e) { return rejectWithValue(e.response?.data || e.message); }
});

export const editEmployee = createAsyncThunk('hrm/editEmployee', async ({ id, payload }, { rejectWithValue }) => {
  try { return await updateEmployee(id, payload); }
  catch (e) { return rejectWithValue(e.response?.data || e.message); }
});

export const downloadPayrollExcel = createAsyncThunk(
  "hrm/downloadPayrollExcel",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const response = await exportPayrollExcel({ month, year });
      return response;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);
export const removeEmployee = createAsyncThunk(
  'hrm/removeEmployee',
  async (employee_id, { rejectWithValue }) => {
    try {
      await deleteEmployee(employee_id);
      return employee_id; // Just return the employee_id that was deleted
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

const initialState = {
  employees: [],
  selectedEmployee: null,
  loading: false,
  error: null,
};

const hrmSlice = createSlice({
  name: 'hrm',
  initialState,
  reducers: {
    clearEmployee: (s) => { s.selectedEmployee = null; },
    clearHrmError: (s) => { s.error = null; },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchEmployees.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchEmployees.fulfilled, (s, a) => { s.loading = false; s.employees = a.payload || []; })
      .addCase(fetchEmployees.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error.message; })

      .addCase(fetchEmployee.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchEmployee.fulfilled, (s, a) => { s.loading = false; s.selectedEmployee = a.payload || null; })
      .addCase(fetchEmployee.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error.message; })

      .addCase(addEmployee.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(addEmployee.fulfilled, (s, a) => { s.loading = false; s.employees.unshift(a.payload); })
      .addCase(addEmployee.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error.message; })

      .addCase(editEmployee.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(editEmployee.fulfilled, (s, a) => {
        s.loading = false;
        const i = s.employees.findIndex((e) => e.id === a.payload.id);
        if (i !== -1) s.employees[i] = a.payload;
        if (s.selectedEmployee?.id === a.payload.id) s.selectedEmployee = a.payload;
      })
      .addCase(editEmployee.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error.message; })

      .addCase(removeEmployee.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(removeEmployee.fulfilled, (s, a) => {
        s.loading = false;
        const deletedEmployeeId = a.payload; // This is the employee_id we returned above
        s.employees = s.employees.filter((e) => e.employee_id !== deletedEmployeeId);
      })
      .addCase(removeEmployee.rejected, (s, a) => { 
        s.loading = false; 
        s.error = a.payload || a.error.message;
      });
        },
});

export const { clearEmployee, clearHrmError } = hrmSlice.actions;
export const selectEmployees = (s) => s.hrm.employees;
export const selectHrmLoading = (s) => s.hrm.loading;
export const selectHrmError = (s) => s.hrm.error;
export default hrmSlice.reducer;

