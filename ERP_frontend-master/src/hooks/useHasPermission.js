
// import { useSelector } from 'react-redux';

// const useHasPermission = (requiredPermission) => {
//   const { permissions } = useSelector(state => state.auth);

//   console.log("=== PERMISSION CHECK ===");
//   console.log("Available permissions:", permissions);
//   console.log("Checking for permission:", requiredPermission);

//   const hasPermission = permissions.includes(requiredPermission);

//   console.log("Result:", hasPermission);
//   console.log("=== END CHECK ===");

//   return hasPermission;
// };

// export default useHasPermission;
// ---------------------




import { useSelector } from 'react-redux';

const useHasPermission = (requiredPermission) => {
  const { permissions } = useSelector(state => state.auth);

  console.log("=== PERMISSION CHECK ===");
  console.log("Available permissions:", permissions);
  console.log("Checking for permission:", requiredPermission);

  if (Array.isArray(requiredPermission)) {
    const hasAnyPermission = requiredPermission.some(perm =>
      permissions.includes(perm)
    );
    console.log("Multiple permission check result:", hasAnyPermission);
    console.log("=== END CHECK ===");
    return hasAnyPermission;
  }
  const hasPermission = permissions.includes(requiredPermission);

  console.log("Result:", hasPermission);
  console.log("=== END CHECK ===");

  return hasPermission;
};

export default useHasPermission;

