// import React, { useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { ChevronDown, ChevronRight } from 'lucide-react';

// const MenuItem = ({ item, userPermissions }) => {
//   const location = useLocation();
//   const [open, setOpen] = useState(false);

//   const hasChildren = item.children && item.children.length > 0;
//   const isActive = (url) => location.pathname === url;

//   if (item.permission && !userPermissions.includes(item.permission)) {
//     return null;
//   }

//   return (
//     <li className="mb-1">
//       {hasChildren ? (
//         <>
//           <button
//             onClick={() => setOpen(!open)}
//             className="flex items-center w-full px-4 py-2 text-sm font-medium text-left hover:bg-gray-100 rounded"
//           >
//             {item.icon && <item.icon className="w-4 h-4 mr-2" />}
//             <span>{item.label}</span>
//             <span className="ml-auto">{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
//           </button>
//           {open && (
//             <ul className="pl-6 mt-1">
//               {item.children.map((child, idx) => (
//                 <MenuItem key={idx} item={child} userPermissions={userPermissions} />
//               ))}
//             </ul>
//           )}
//         </>
//       ) : (
//         <Link
//           to={item.to}
//           className={`flex items-center px-4 py-2 text-sm font-medium rounded hover:bg-gray-100 ${
//             isActive(item.to) ? 'bg-gray-200 font-semibold' : ''
//           }`}
//         >
//           {item.icon && <item.icon className="w-4 h-4 mr-2" />}
//           {item.label}
//         </Link>
//       )}
//     </li>
//   );
// };

// export default MenuItem;






// import React, { useMemo, useState } from "react";
// import { NavLink, useLocation, matchPath } from "react-router-dom";
// import { FaChevronDown, FaChevronRight } from "react-icons/fa";

// /**
//  * Props shape (for every node):
//  * {
//  *   label: string,
//  *   to?: string,
//  *   icon?: ReactNode,
//  *   children?: MenuItemConfig[],
//  *   active?: boolean              // optional, if you pre-compute it
//  * }
//  */
// const MenuItem = ({ label, to, icon, children = [], active }) => {
//   const location = useLocation();

//   const hasChildren = Array.isArray(children) && children.length > 0;

//   // Is this leaf active (when it has a route)?
//   const isLeafActive = useMemo(() => {
//     if (!to) return false;
//     // Treat a node active if the current path starts with its path (typical sidebar behavior)
//     return Boolean(
//       matchPath({ path: to === "/" ? "/" : `${to}/*` }, location.pathname) ||
//       matchPath({ path: to }, location.pathname)
//     );
//   }, [to, location.pathname]);

//   // Is any descendant active?
//   const isAnyChildActive = useMemo(() => {
//     if (!hasChildren) return false;
//     return children.some((c) => isNodeActive(c, location.pathname));
//   }, [children, hasChildren, location.pathname]);

//   // Resolve node active (group or leaf)
//   const isNodeActiveResolved = active ?? (hasChildren ? isAnyChildActive : isLeafActive);

//   // Open group if it's active by default
//   const [open, setOpen] = useState(isNodeActiveResolved);

//   // keep it open if route changes to a child
//   React.useEffect(() => {
//     if (isNodeActiveResolved) setOpen(true);
//   }, [isNodeActiveResolved]);

//   if (!hasChildren) {
//     return (
//       <li className="mb-1">
//         <NavLink
//           to={to || "#"}
//           className={({ isActive }) =>
//             `flex items-center px-4 py-2 text-sm font-medium rounded hover:bg-gray-100 transition ${
//               isActive || isLeafActive ? "bg-gray-200 font-semibold" : ""
//             }`
//           }
//         >
//           {icon && <span className="mr-2">{icon}</span>}
//           {label}
//         </NavLink>
//       </li>
//     );
//   }

//   return (
//     <li className={`mb-1 ${isNodeActiveResolved ? "active" : ""}`}>
//       <button
//         onClick={() => setOpen((o) => !o)}
//         className={`flex items-center w-full px-4 py-2 text-sm font-medium text-left hover:bg-gray-100 rounded transition ${
//           isNodeActiveResolved ? "bg-gray-200 font-semibold" : ""
//         }`}
//       >
//         {icon && <span className="mr-2">{icon}</span>}
//         <span>{label}</span>
//         <span className="ml-auto">
//           {open ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
//         </span>
//       </button>

//       {open && (
//         <ul className="ml-4 mt-1">
//           {children.map((child, idx) => (
//           <MenuItem key={idx} {...child} />
//           ))}
//         </ul>
//       )}
//     </li>
//   );
// };

// export default MenuItem;

// /* ---------- helpers ---------- */

// function isNodeActive(node, pathname) {
//   const hasChildren = Array.isArray(node.children) && node.children.length > 0;

//   if (node.active !== undefined) return node.active;

//   if (node.to) {
//     if (
//       matchPath({ path: node.to === "/" ? "/" : `${node.to}/*` }, pathname) ||
//       matchPath({ path: node.to }, pathname)
//     ) {
//       return true;
//     }
//   }

//   if (!hasChildren) return false;

//   return node.children.some((c) => isNodeActive(c, pathname));
// }


















import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

const MenuItem = ({ label, to, icon, children }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = React.Children.count(children) > 0;

  return (
    <li className="mb-1">
      {hasChildren ? (
        <>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-left hover:bg-gray-100 rounded transition"
          >
            {icon && <span className="mr-2">{icon}</span>}
            <span>{label}</span>
            <span className="ml-auto">
              {open ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
            </span>
          </button>
          {open && <ul className="ml-4 mt-1">{children}</ul>}
        </>
      ) : (
        <NavLink
          to={to}
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-sm font-medium rounded hover:bg-gray-100 transition ${
              isActive ? 'bg-gray-200 font-semibold' : ''
            }`
          }
        >
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </NavLink>
      )}
    </li>
  );
};

export default MenuItem;