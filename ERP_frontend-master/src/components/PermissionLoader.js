import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserPermissions } from '../redux/slices/authSlice';

const PermissionLoader = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, permissions, loading } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated && permissions.length === 0 && !loading) {
      console.log("Fetching permissions...");
      dispatch(fetchUserPermissions());
    }
  }, [isAuthenticated, permissions.length, dispatch, loading]);

  return children;
};

export default PermissionLoader;  