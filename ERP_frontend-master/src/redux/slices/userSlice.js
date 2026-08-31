// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { fetchUsers } from "../../services/userService";

// export const getUsers = createAsyncThunk("user/getUsers", async (_, thunkAPI) => {
//   try {
//     return await fetchUsers();
//   } catch (error) {
//     return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch users");
//   }
// });

// const userSlice = createSlice({
//   name: "user",
//   initialState: {
//     users: [],
//     loading: false,
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(getUsers.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getUsers.fulfilled, (state, action) => {
//         state.loading = false;
//         state.users = action.payload;
//       })
//       .addCase(getUsers.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export default userSlice.reducer;


// src/redux/slices/userSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchUsers } from "../../services/userService";

// Async thunk to fetch users
export const getUsers = createAsyncThunk("users/getUsers", async () => {
  const users = await fetchUsers();
  return users;
});

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;
