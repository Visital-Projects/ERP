// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import apiClient from "../../services/apiClient";

// // Read from localStorage on init
// const userFromStorage = localStorage.getItem("user");
// const tokenFromStorage = localStorage.getItem("token");

// export const login = createAsyncThunk(
//   "auth/login",
//   async (credentials, thunkAPI) => {
//     try {
//       const response = await apiClient.post("/auth/login", credentials);
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message ||
//         "Login failed. Please check your credentials."
//       );
//     }
//   }
// );

// const initialState = {
//   user: userFromStorage ? JSON.parse(userFromStorage) : null,
//   token: tokenFromStorage || null,
//   isAuthenticated: !!tokenFromStorage,
//   error: null,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.isAuthenticated = false;
//       state.error = null;
//       localStorage.removeItem("user");
//       localStorage.removeItem("token");
//     },
//     updateUser: (state, action) => {
//       state.user = { ...state.user, ...action.payload }; // merge new user data
//       localStorage.setItem("user", JSON.stringify(state.user));
//     },
//   },

//   extraReducers: (builder) => {
//     builder
//       .addCase(login.fulfilled, (state, action) => {
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//         state.isAuthenticated = true;
//         state.error = null;

//         localStorage.setItem("user", JSON.stringify(action.payload.user));
//         localStorage.setItem("token", action.payload.token);
//       })
//       .addCase(login.rejected, (state, action) => {
//         state.error = action.payload || "Login failed.";
//       });
//   },
// });

// export const { logout, updateUser } = authSlice.actions;
// export default authSlice.reducer;







// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import apiClient from "../../services/apiClient";

// // Read from localStorage on init
// const userFromStorage = localStorage.getItem("user");
// const tokenFromStorage = localStorage.getItem("token");

// export const login = createAsyncThunk(
//   "auth/login",
//   async (credentials, thunkAPI) => {
//     try {
//       const response = await apiClient.post("/auth/login", credentials);
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message ||
//         "Login failed. Please check your credentials."
//       );
//     }
//   }
// );

// // Add this new thunk to fetch user permissions
// export const fetchUserPermissions = createAsyncThunk(
//   "auth/fetchPermissions",
//   async (_, thunkAPI) => {
//     try {
//       const response = await apiClient.get("/auth/me");
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || "Failed to fetch user permissions"
//       );
//     }
//   }
// );

// const initialState = {
//   user: userFromStorage ? JSON.parse(userFromStorage) : null,
//   token: tokenFromStorage || null,
//   isAuthenticated: !!tokenFromStorage,
//   permissions: [], // Add permissions array
//   error: null,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.isAuthenticated = false;
//       state.permissions = []; // Clear permissions on logout
//       state.error = null;
//       localStorage.removeItem("user");
//       localStorage.removeItem("token");
//     },
//     updateUser: (state, action) => {
//       state.user = { ...state.user, ...action.payload };
//       localStorage.setItem("user", JSON.stringify(state.user));
//     },
//     setPermissions: (state, action) => {
//       state.permissions = action.payload; // Add setPermissions reducer
//     },
//   },

//   extraReducers: (builder) => {
//     builder
//       .addCase(login.fulfilled, (state, action) => {
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//         state.isAuthenticated = true;
//         state.error = null;

//         localStorage.setItem("user", JSON.stringify(action.payload.user));
//         localStorage.setItem("token", action.payload.token);
//       })
//       .addCase(login.rejected, (state, action) => {
//         state.error = action.payload || "Login failed.";
//       })
//       .addCase(fetchUserPermissions.fulfilled, (state, action) => {
//         state.permissions = action.payload.permissions || [];
//       });
//   },
// });

// export const { logout, updateUser, setPermissions } = authSlice.actions;
// export default authSlice.reducer;



// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import apiClient from "../../services/apiClient";

// // Read from localStorage on init
// const userFromStorage = localStorage.getItem("user");
// const tokenFromStorage = localStorage.getItem("token");

// export const login = createAsyncThunk(
//   "auth/login",
//   async (credentials, thunkAPI) => {
//     try {
//       const response = await apiClient.post("/auth/login", credentials);
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message ||
//         "Login failed. Please check your credentials."
//       );
//     }
//   }
// );

// // Add this thunk to fetch user permissions
// export const fetchUserPermissions = createAsyncThunk(
//   "auth/fetchPermissions",
//   async (_, thunkAPI) => {
//     try {
//       const response = await apiClient.get("/auth/me");
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || "Failed to fetch user permissions"
//       );
//     }
//   }
// );

// const initialState = {
//   user: userFromStorage ? JSON.parse(userFromStorage) : null,
//   token: tokenFromStorage || null,
//   isAuthenticated: !!tokenFromStorage,
//   permissions: [], // Add permissions array
//   error: null,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.isAuthenticated = false;
//       state.permissions = []; // Clear permissions on logout
//       state.error = null;
//       localStorage.removeItem("user");
//       localStorage.removeItem("token");
//     },
//     updateUser: (state, action) => {
//       state.user = { ...state.user, ...action.payload };
//       localStorage.setItem("user", JSON.stringify(state.user));
//     },
//   },

//   extraReducers: (builder) => {
//     builder
//       .addCase(login.fulfilled, (state, action) => {
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//         state.isAuthenticated = true;
//         state.error = null;

//         localStorage.setItem("user", JSON.stringify(action.payload.user));
//         localStorage.setItem("token", action.payload.token);
//       })
//       .addCase(login.rejected, (state, action) => {
//         state.error = action.payload || "Login failed.";
//       })
//       // .addCase(fetchUserPermissions.fulfilled, (state, action) => {
//       //   state.permissions = action.payload.permissions || [];
//       // });
//       .addCase(fetchUserPermissions.fulfilled, (state, action) => {
//         console.log("Backend returned these permissions:", action.payload.permissions);
//         state.permissions = action.payload.permissions || [];
//       })
//   },
// });

// export const { logout, updateUser } = authSlice.actions;
// export default authSlice.reducer;


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";

// Read from localStorage on init
const userFromStorage = localStorage.getItem("user");
const tokenFromStorage = localStorage.getItem("token");

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    }
  }
);

// Add this thunk to fetch user permissions
export const fetchUserPermissions = createAsyncThunk(
  "auth/fetchPermissions",
  async (_, thunkAPI) => {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch user permissions"
      );
    }
  }
);

const initialState = {
  user: userFromStorage ? JSON.parse(userFromStorage) : null,
  token: tokenFromStorage || null,
  isAuthenticated: !!tokenFromStorage,
  permissions: [], // Add permissions array
  error: null,
  loading: false, // Add loading state
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.permissions = []; // Clear permissions on logout
      state.error = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.loading = false;

        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed.";
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        // console.log("Backend returned these permissions:", action.payload.permissions);
        state.permissions = action.payload.permissions || [];
        state.loading = false;
      })
      .addCase(fetchUserPermissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch permissions";
        console.error("Failed to fetch permissions:", action.payload);
      });
  },
});

export const { logout, updateUser, setPermissions } = authSlice.actions;
export default authSlice.reducer;