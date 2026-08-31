// import React from "react";
// import { useSelector } from "react-redux";
// import { Navigate } from "react-router-dom";

// const PrivateRoute = ({ children }) => {
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   return isAuthenticated ? children : <Navigate to="/login" />;
// };
// export default PrivateRoute;

import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, permissions } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Optional: Check for specific permission if provided
  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default PrivateRoute;
