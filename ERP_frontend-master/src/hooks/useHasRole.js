// import { useSelector } from "react-redux";

// export function useHasRole(requiredRoles = []) {
//   const { user } = useSelector((state) => state.auth);
//   if (!user?.roles) return false;

//   // agar ek bhi role match kare to true
//   return requiredRoles.some((role) => user.roles.includes(role));
// }


// ye hook check karega ki user ke paas required permission hai ya nahi
import { useSelector } from "react-redux";

export function useHasPermission(requiredPermissions = []) {
  const { user } = useSelector((state) => state.auth);

  if (!user?.permissions) return false;

  // check karega ki user ke permissions me se koi ek required permission match ho rahi hai ya nahi
  return requiredPermissions.some((perm) =>
    user.permissions.includes(perm)
  );
}
