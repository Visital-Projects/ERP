// import React, { useRef, useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { logout } from "../redux/slices/authSlice";
// import { useNavigate, Link } from "react-router-dom";
// import {
//   FaChevronDown,
//   FaComments,
//   FaUser,
//   FaSignOutAlt,
//   FaBars,
// } from "react-icons/fa";

// // Hook to detect outside click
// function useOutsideClick(ref, handler) {
//   useEffect(() => {
//     const listener = (e) => {
//       if (!ref.current || ref.current.contains(e.target)) return;
//       handler();
//     };
//     document.addEventListener("mousedown", listener);
//     document.addEventListener("touchstart", listener);
//     return () => {
//       document.removeEventListener("mousedown", listener);
//       document.removeEventListener("touchstart", listener);
//     };
//   }, [ref, handler]);
// }

// const Header = ({ onToggleSidebar }) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // ✅ Always get latest user from Redux
//   const user = useSelector((state) => state.auth.user);

//   const [profileOpen, setProfileOpen] = useState(false);
//   const profileRef = useRef(null);
//   useOutsideClick(profileRef, () => setProfileOpen(false));

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate("/login");
//   };

//   return (
//     <div className="container-fluid bg-white shadow-sm py-2">
//       <div className="d-flex justify-content-between align-items-center px-3">
//         {/* Left Section */}
//         <div className="d-flex align-items-center gap-3">
//           {/* Sidebar Toggle Button */}
//           <button
//             className="btn btn-light border shadow-sm me-2 d-lg-none"
//             onClick={onToggleSidebar}
//           >
//             <FaBars />
//           </button>

//           {/* User Info */}
//           <div className="position-relative" ref={profileRef}>
//             <div
//               className="d-flex align-items-center bg-white border rounded px-3 py-2 shadow-sm"
//               onClick={() => setProfileOpen((prev) => !prev)}
//               style={{ cursor: "pointer" }}
//             >
//              <img
//   src={
//     user?.avatar
//       ? `https://erpcopy.vnvision.in/uploads/avatars/${user.avatar}`
//       : "https://erpcop.vnvision.in/uploads/avatars/avatar.png"
//   }
//   alt="Avatar"
//   className="rounded-circle me-2"
//   width="30"
//   height="30"
// />

//               <span className="me-1">
//                 Hi, <strong>{user?.name || "User"}</strong>!
//               </span>
//               <FaChevronDown className="text-muted small" />
//             </div>

//             {profileOpen && (
//               <div className="dropdown-menu dropdown-menu-right show mt-2 shadow">
//                 <button
//                   className="dropdown-item d-flex align-items-center"
//                   onClick={() => {
//                     setProfileOpen(false);
//                     navigate("/profile"); // go to profile page
//                   }}
//                 >
//                   <FaUser className="me-2" /> Profile
//                 </button>

//                 <button
//                   className="dropdown-item d-flex align-items-center"
//                   onClick={handleLogout}
//                 >
//                   <FaSignOutAlt className="me-2" /> Logout
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Right Section */}
//         <div className="d-flex align-items-center gap-3">
//           {user?.type !== "client" && user?.type !== "super admin" && (
//             <Link
//               to="/chats"
//               className="position-relative bg-white border rounded px-3 py-2 shadow-sm d-flex align-items-center"
//             >
//               <FaComments className="text-primary" />
//             </Link>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Header;




import React, { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import {
  FaChevronDown,
  FaComments,
  FaUser,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import { fetchProfile } from "../services/userService"; // ✅ Import service

function useOutsideClick(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

const Header = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reduxUser = useSelector((state) => state.auth.user);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  useOutsideClick(profileRef, () => setProfileOpen(false));

  // ✅ New state for profile fetched from API
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Prefer fetched profile over Redux user
  const user = profile || reduxUser;

  return (
    <div className="container-fluid bg-white shadow-sm py-2">
      <div className="d-flex justify-content-between align-items-center px-3">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-light border shadow-sm me-2 d-lg-none"
            onClick={onToggleSidebar}
          >
            <FaBars />
          </button>

          <div className="position-relative" ref={profileRef}>
            <div
              className="d-flex align-items-center bg-white border rounded px-3 py-2 shadow-sm"
              onClick={() => setProfileOpen((prev) => !prev)}
              style={{ cursor: "pointer" }}
            >

              
              <img
                src={
                  user?.avatar
                    ? `${import.meta.env.VITE_BASE_URL}/${user.avatar}`
                    : `${import.meta.env.VITE_AVATARS_BASE_URL}avatars/avatar.png`
                }
                alt="Avatar"
                className="rounded-circle me-2"
                width="30"
                height="30"
              />
              <span className="me-1">
                Hi, <strong>{user?.name || "User"}</strong>!
              </span>
              <FaChevronDown className="text-muted small" />
            </div>

            {profileOpen && (
              <div className="dropdown-menu dropdown-menu-right show mt-2 shadow">
                <button
                  className="dropdown-item d-flex align-items-center"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                >
                  <FaUser className="me-2" /> Profile
                </button>

                <button
                  className="dropdown-item d-flex align-items-center"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="me-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* <div className="d-flex align-items-center gap-3">
          {user?.type !== "client" && user?.type !== "super admin" && (
            <Link
              to="/chats"
              className="position-relative bg-white border rounded px-3 py-2 shadow-sm d-flex align-items-center"
            >
              <FaComments className="text-primary" />
            </Link>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default Header;
