
// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appReducer from './slices/appSlice';
import { api } from '../services/api';
import hrmReducer from './slices/hrmSlice';
import userReducer from './slices/userSlice';
import roleReducer from "./slices/roleSlice";
// import clientReducer from "./slices/ClientSlice";
// import productReducer from "./slices/ProductSlice";
// import productstockReducer from './slices/ProductstockSlice';



const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    hrm: hrmReducer,
    user: userReducer,
    roles: roleReducer,
    // clients: clientReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (gDM) => gDM().concat(api.middleware),
});

export default store;
