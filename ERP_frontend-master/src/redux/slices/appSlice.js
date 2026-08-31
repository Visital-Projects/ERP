import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/apiClient';
// import apiClient from '@/services/apiClient';

// ---- Thunks ----
export const getSettings = createAsyncThunk(
  'app/getSettings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/settings');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getLanguages = createAsyncThunk(
  'app/getLanguages',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/languages');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ---- Initial State ----
const initialState = {
  settings: {},
  languages: {},
  loading: false,
  error: null,
};

// ---- Slice ----
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSettings(state, action) {
      state.settings = action.payload || {};
    },
    setLanguages(state, action) {
      state.languages = action.payload || {};
    },
    clearAppError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getSettings
      .addCase(getSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload || {};
      })
      .addCase(getSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // getLanguages
      .addCase(getLanguages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLanguages.fulfilled, (state, action) => {
        state.loading = false;
        state.languages = action.payload || {};
      })
      .addCase(getLanguages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setSettings, setLanguages, clearAppError } = appSlice.actions;

export default appSlice.reducer;

// ---- Selectors (optional but handy) ----
export const selectApp = (state) => state.app || initialState;
export const selectSettings = (state) => (state.app?.settings ?? {});
export const selectLanguages = (state) => (state.app?.languages ?? {});
export const selectAppLoading = (state) => !!state.app?.loading;
export const selectAppError = (state) => state.app?.error || null;

