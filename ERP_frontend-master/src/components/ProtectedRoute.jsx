import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // check roles dynamically
  if (allowedRoles?.length > 0) {
    const hasRole = allowedRoles.some((role) => user?.roles?.includes(role));
    if (!hasRole)
      return <div className="p-5 text-center">🚫 Access Denied</div>;
  }

  return <Outlet />;
};

export default PrivateRoute;
