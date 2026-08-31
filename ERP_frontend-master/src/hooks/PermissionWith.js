import React from "react";
import useHasPermission from "../hooks/useHasPermission";

// PermissionWith.js


const PermissionWith = ({ permission, children, fallback = null }) => {
  const hasPermission = useHasPermission(permission);

  return hasPermission ? children : fallback;
};

export default PermissionWith;


// +++++++++++++++++++++++++++++

