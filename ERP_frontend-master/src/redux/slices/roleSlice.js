// src/redux/slices/roleSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole
} from "../../services/roleService";

export const getRoles = createAsyncThunk("roles/getRoles", async () => {
  const data = await fetchRoles();
  return data;
});

export const addRole = createAsyncThunk("roles/addRole", async (roleData) => {
  const data = await createRole(roleData);
  return data;
});

export const editRole = createAsyncThunk("roles/editRole", async ({ id, roleData }) => {
  const data = await updateRole(id, roleData);
  return data;
});

export const removeRole = createAsyncThunk("roles/removeRole", async (id) => {
  await deleteRole(id);
  return id;
});

const roleSlice = createSlice({
  name: "roles",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(getRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(addRole.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      .addCase(editRole.fulfilled, (state, action) => {
        const index = state.list.findIndex((role) => role.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      .addCase(removeRole.fulfilled, (state, action) => {
        state.list = state.list.filter((role) => role.id !== action.payload);
      });
  },
});

export default roleSlice.reducer;
