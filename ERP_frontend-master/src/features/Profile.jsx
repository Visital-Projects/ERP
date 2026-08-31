// // src/pages/Profile.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { updateProfile, changePassword } from "../services/userService";
// import { updateUser } from "../redux/slices/authSlice";
// import { Form, Button, Card, Row, Col, Alert } from "react-bootstrap";

// const Profile = () => {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);

//   const defaultAvatar =
//     "https://erpcopy.vnvision.in/uploads/avatars/avatar.png";

//   // Local state
//   const [name, setName] = useState(user?.name || "");
//   const [email, setEmail] = useState(user?.email || "");
//   const [avatar, setAvatar] = useState(null);
//   const [preview, setPreview] = useState(defaultAvatar);

//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   // Messages
//   const [profileMessage, setProfileMessage] = useState(null);
//   const [profileError, setProfileError] = useState(null);
//   const [passwordMessage, setPasswordMessage] = useState(null);
//   const [passwordError, setPasswordError] = useState(null);

//   // Refs
//   const profileRef = useRef(null);
//   const passwordRef = useRef(null);

//   const [activeTab, setActiveTab] = useState("profile");

//   // Scroll listener
//   useEffect(() => {
//     const handleScroll = () => {
//       const profileTop = profileRef.current.offsetTop - 120;
//       const passwordTop = passwordRef.current.offsetTop - 120;
//       const scrollY = window.scrollY;

//       if (scrollY >= passwordTop) {
//         setActiveTab("password");
//       } else {
//         setActiveTab("profile");
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // Sync Redux user → show avatar (supports both filename & full URL)
//   useEffect(() => {
//     setName(user?.name || "");
//     setEmail(user?.email || "");
//     if (user?.avatar) {
//       if (user.avatar.startsWith("http")) {
//         setPreview(user.avatar);
//       } else {
//         setPreview(
//           `https://erpcopy.vnvision.in/uploads/avatars/${user.avatar}`
//         );
//       }
//     } else {
//       setPreview(defaultAvatar);
//     }
//   }, [user]);

//   // Scroll to section
//   const scrollToRef = (ref, tab) => {
//     setActiveTab(tab);
//     window.scrollTo({
//       top: ref.current.offsetTop - 80,
//       behavior: "smooth",
//     });
//   };

//   // Handle Profile Update
//   const handleProfileUpdate = async (e) => {
//     e.preventDefault();
//     try {
//       const formData = new FormData();
//       formData.append("name", name);
//       formData.append("email", email);
//       if (avatar) formData.append("avatar", avatar);

//       const res = await updateProfile(formData);

//       // Update Redux
//       dispatch(updateUser(res));

//       // Success message
//       setProfileMessage("Profile updated successfully!");
//       setProfileError(null);

//       // Update preview instantly
//       if (res.avatar) {
//         if (res.avatar.startsWith("http")) {
//           setPreview(res.avatar);
//         } else {
//           setPreview(
//             `https://erpvcopy.vnvision.in/uploads/avatars/${res.avatar}`
//           );
//         }
//       } else {
//         setPreview(defaultAvatar);
//       }
//     } catch (err) {
//       setProfileError(
//         err.response?.data?.message || "Failed to update profile"
//       );
//     }
//   };

//   // Handle Password Change
//   const handleChangePassword = async (e) => {
//     e.preventDefault();
//     if (newPassword !== confirmPassword) {
//       setPasswordError("Passwords do not match");
//       return;
//     }
//     try {
//       await changePassword(user.id, {
//         oldPassword,
//         newPassword,
//         confirmPassword,
//       });
//       setPasswordMessage("Password changed successfully!");
//       setPasswordError(null);
//       setOldPassword("");
//       setNewPassword("");
//       setConfirmPassword("");
//     } catch (err) {
//       setPasswordError(
//         err.response?.data?.message || "Failed to change password"
//       );
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <Row>
//         {/* Left Tabs */}
//         <Col md={3}>
//           <div
//             style={{
//               position: "fixed",
//               top: "80px",
//               width: "250px",
//             }}
//           >
//             <Card className="shadow-sm p-3">
//               <div
//                 className={`p-3 mb-2 rounded text-center ${
//                   activeTab === "profile" ? "bg-success text-white" : "bg-light"
//                 }`}
//                 style={{ cursor: "pointer", transition: "0.3s" }}
//                 onClick={() => scrollToRef(profileRef, "profile")}
//               >
//                 Profile
//               </div>
//               <div
//                 className={`p-3 rounded text-center ${
//                   activeTab === "password"
//                     ? "bg-success text-white"
//                     : "bg-light"
//                 }`}
//                 style={{ cursor: "pointer", transition: "0.3s" }}
//                 onClick={() => scrollToRef(passwordRef, "password")}
//               >
//                 Change Password
//               </div>
//             </Card>
//           </div>
//         </Col>

//         {/* Right Content */}
//         <Col md={{ span: 9, offset: 3 }}>
//           {/* Profile Update */}
//           <div ref={profileRef}>
//             <Card className="shadow-sm p-3 mb-4" style={{ minHeight: "400px" }}>
//               <h4>Update Profile</h4>
//               {profileMessage && (
//                 <Alert variant="success">{profileMessage}</Alert>
//               )}
//               {profileError && <Alert variant="danger">{profileError}</Alert>}
//               <Form onSubmit={handleProfileUpdate}>
//                 <Row>
//                   <Col md={6}>
//                     <Form.Group className="mb-3 mt-5">
//                       <Form.Label>Name</Form.Label>
//                       <Form.Control
//                         type="text"
//                         value={name}
//                         onChange={(e) => setName(e.target.value)}
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group className="mb-3 mt-5">
//                       <Form.Label>Email</Form.Label>
//                       <Form.Control
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>

//                 {/* Avatar */}
//                 <Form.Group className="mb-3 text-center mt-5">
//                   {/* <Form.Label>Current Avatar</Form.Label>
//                   <div>
//                     <img
//                       src={preview}
//                       alt="User Avatar"
//                       style={{
//                         width: "120px",
//                         height: "120px",
//                         borderRadius: "50%",
//                         objectFit: "cover",
//                         border: "2px solid #ddd",
//                         marginBottom: "10px",
//                       }}
//                     />
//                   </div> */}
//                   <Form.Control
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => {
//                       const file = e.target.files[0];
//                       setAvatar(file);
//                       if (file) setPreview(URL.createObjectURL(file));
//                     }}
//                   />
//                 </Form.Group>

//                 <Button variant="success" type="submit">
//                   Save Changes
//                 </Button>
//               </Form>
//             </Card>
//           </div>

//           {/* Change Password */}
//           <div ref={passwordRef}>
//             <Card className="shadow-sm p-3 mb-4" style={{ minHeight: "400px" }}>
//               <h4>Change Password</h4>
//               {passwordMessage && (
//                 <Alert variant="success">{passwordMessage}</Alert>
//               )}
//               {passwordError && <Alert variant="danger">{passwordError}</Alert>}
//               <Form onSubmit={handleChangePassword}>
//                 <Row>
//                   <Col md={6}>
//                     <Form.Group className="mb-3 mt-5">
//                       <Form.Label>Old Password</Form.Label>
//                       <Form.Control
//                         type="password"
//                         value={oldPassword}
//                         onChange={(e) => setOldPassword(e.target.value)}
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group className="mb-3 mt-5">
//                       <Form.Label>New Password</Form.Label>
//                       <Form.Control
//                         type="password"
//                         value={newPassword}
//                         onChange={(e) => setNewPassword(e.target.value)}
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>

//                 <Form.Group className="mb-3 mt-5">
//                   <Form.Label>Confirm Password</Form.Label>
//                   <Form.Control
//                     type="password"
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                   />
//                 </Form.Group>

//                 <Button variant="success" type="submit">
//                   Change Password
//                 </Button>
//               </Form>
//             </Card>
//           </div>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default Profile;

// src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile, changePassword, fetchProfile } from "../services/userService";
import { updateUser } from "../redux/slices/authSlice";
import { Form, Button, Card, Row, Col, Alert } from "react-bootstrap";
import BreadCrumb from "../components/BreadCrumb.JSX";
import { useNavigate, useLocation } from "react-router-dom";
import "./Profile.css";
import { FiUpload } from "react-icons/fi";
import { MdEdit } from "react-icons/md";

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const defaultAvatar = null;

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const AVATARS_BASE_URL = import.meta.env.VITE_AVATARS_BASE_URL;

  // Local state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(defaultAvatar);
  const [profile, setProfile] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Messages
  const [profileMessage, setProfileMessage] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // Refs
  const profileRef = useRef(null);
  const passwordRef = useRef(null);
  let [hover, setHover] = React.useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const navigate = useNavigate();
  const location = useLocation();

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const profileTop = profileRef.current.offsetTop - 120;
      const passwordTop = passwordRef.current.offsetTop - 120;
      const scrollY = window.scrollY;

      if (scrollY >= passwordTop) {
        setActiveTab("password");
      } else {
        setActiveTab("profile");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


    // // Sync Redux user → show avatar (supports both filename & full URL)
    // useEffect(() => {
    //   setName(user?.name || "");
    //   setEmail(user?.email || "");
    //   if (user?.avatar) {
    //     if (user.avatar.startsWith("http")) {
    //       setPreview(user.avatar);
    //     } else {
    //       // setPreview(
    //       //   `https://erpcopy.vnvision.in/uploads/avatars/${user.avatar}`
    //       // );
    //       setPreview(`${AVATARS_BASE_URL}avatars/${user.avatar}`);
        
    //     }
    //   } else {
    //     setPreview(defaultAvatar);
    //   }
    // }, [user , AVATARS_BASE_URL]);

  useEffect(() => {
    const userData = profile || user;
  
    if (userData?.avatar) {
      const finalURL = userData.avatar.startsWith("http")
        ? userData.avatar
        : `${import.meta.env.VITE_BASE_URL}/${userData.avatar}`;
  
      setPreview(finalURL);
    } else {
      setPreview(`${AVATARS_BASE_URL}avatars/avatar.png`);
    }
  
    setName(userData?.name || "");
    setEmail(userData?.email || "");
  }, [profile, user, AVATARS_BASE_URL]);
  

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

  // Scroll to section
  const scrollToRef = (ref, tab) => {
    setActiveTab(tab);
    window.scrollTo({
      top: ref.current.offsetTop - 80,
      behavior: "smooth",
    });
  };

  // Handle Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (avatar) formData.append("avatar", avatar);

      const res = await updateProfile(formData);

      // Update Redux
      dispatch(updateUser(res));

      // Success message
      setProfileMessage("Profile updated successfully!");
      setProfileError(null);

      // Update preview instantly
      if (res.avatar) {
        if (res.avatar.startsWith("http")) {
          setPreview(res.avatar);
        } else {
          // setPreview(
          //   `https://erpcopy.vnvision.in/uploads/avatars/${res.avatar}`
          // );
          setPreview(`${AVATARS_BASE_URL}avatars/${res.avatar}`);
        }
      } else {
        setPreview(defaultAvatar);
      }
    } catch (err) {
      setProfileError(
        err.response?.data?.message || "Failed to update profile"
      );
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    try {
      await changePassword(user.id, {
        oldPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordMessage("Password changed successfully!");
      setPasswordError(null);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Failed to change password"
      );
    }
  };

  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // setScrollPosition(window.scrollY);
      if (window.scrollY > 150) {
        setScrollPosition(true);
      } else {
        setScrollPosition(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const [image, setImage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // preview the image
    }
  };

  return (
    <div className="container mt-4">
      {/* <div>
        <h4 className="fw-bold mb-0" style={{ position: "fixed" }}>
          Profile Account
        </h4>
        <BreadCrumb
          pathname={location.pathname}
          onNavigate={navigate}
          styles={{ position: "fixed", top: "120px" }}
        />
      </div> */}
      <div className="position-fixed">
        <h4 className="fw-bold mb-0">Profile Account</h4>
        <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
      </div>

      <Row style={{ flexWrap: "nowrap" }}>
        {/* Left Tabs */}
        <Col md={3}>
          <div
            style={{
              position: "fixed",
              top: "160px",
              width: "290px",
            }}
          >
            <Card className="shadow-sm rounded overflow-hidden">
              <div
                className={`p-3 text-center ${
                  !scrollPosition ? "bg-success text-white" : "bg-light"
                }`}
                style={{ cursor: "pointer", transition: "0.3s" }}
                onClick={() => scrollToRef(profileRef, "profile")}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <h6
                    style={{ color: scrollPosition ? "black" : "white" }}
                    className="m-0"
                  >
                    Personal Info
                  </h6>
                  <h6
                    style={{ color: scrollPosition ? "black" : "white" }}
                    className="m-0"
                  >
                    &gt;
                  </h6>
                </div>
              </div>
              <div
                className={`p-3 text-center ${
                  scrollPosition ? "bg-success text-white" : "bg-light"
                }`}
                style={{ cursor: "pointer", transition: "0.3s" }}
                onClick={() => scrollToRef(passwordRef, "password")}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <h6
                    style={{ color: !scrollPosition ? "black" : "white" }}
                    className="m-0"
                  >
                    Change Password
                  </h6>
                  <h6
                    style={{ color: !scrollPosition ? "black" : "white" }}
                    className="m-0"
                  >
                    &gt;
                  </h6>
                </div>
              </div>
            </Card>
          </div>
        </Col>

        {/* Right Content */}
        <Col style={{ marginTop: "72px" }}>
          {/* Profile Update */}
          <div ref={profileRef}>
            <Card className="shadow-sm p-3 mb-4" style={{ minHeight: "400px" }}>
              <Card.Header
                className="d-flex justify-content-between align-items-center card-header"
                style={{ padding: "25px 25px 0px 25px" }}
              >
                <h5>Personal Info</h5>
              </Card.Header>
              {profileMessage && (
                <Alert variant="success">{profileMessage}</Alert>
              )}
              {profileError && <Alert variant="danger">{profileError}</Alert>}
              <Form onSubmit={handleProfileUpdate}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3 mt-4">
                      <Form.Label>
                        <h5>Name</h5>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3 mt-4">
                      <Form.Label>
                        <h5>Email</h5>
                      </Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Avatar */}
                <Form.Group className="mb-3 ">
                  {/* <Form.Label>Current Avatar</Form.Label>
                  <div>
                    <img
                      src={preview}
                      alt="User Avatar"
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #ddd",
                        marginBottom: "10px",
                      }}
                    />
                  </div> */}
                  {/* <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setAvatar(file);
                      if (file) setPreview(URL.createObjectURL(file));
                    }}
                  /> */}
                  <div
                    className="pfp-preview"
                    style={{
                      margin: "10px",
                      width: "15%",
                      borderRadius: "9999px",
                      aspectRatio: "1/1",
                      position: "relative",
                      overflow: "hidden",
                      border: "1px solid black",
                    }}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                  >
                    {hover && (
                      <>
                        <div className="pfp-edit-overlay"></div>
                        <div className="pfp-img-edit">
                          <MdEdit size={25} />
                        </div>
                      </>
                    )}
                    <img
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                        width: "100%",
                        height: "100%",
                      }}
                      src={preview}
                      alt=""
                    />
                  </div>

                  <label htmlFor="fileInput" className="d-inline-block">
                    <Button
                      as="span"
                      variant="success"
                      className="d-flex align-items-center justify-content-center gap-2"
                    >
                      <FiUpload />
                      Choose file here
                    </Button>
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setAvatar(file);
                      if (file) setPreview(URL.createObjectURL(file));
                    }}
                    className="d-none"
                    id="fileInput"
                  />
                </Form.Group>
                <p style={{ opacity: "0.6" }}>
                  Please upload a valid image file. Size of image should not be
                  more that 2MB{" "}
                </p>

                <Button
                  variant="success"
                  type="submit"
                  style={{ float: "right" }}
                >
                  Save Changes
                </Button>
              </Form>
            </Card>
          </div>

          {/* Change Password */}
          <div ref={passwordRef}>
            <Card className="shadow-sm p-3 mb-4" style={{ minHeight: "400px" }}>
              <Card.Header
                className="d-flex justify-content-between align-items-center card-header"
                style={{ padding: "25px 25px 0px 25px" }}
              >
                <h5>Change Password</h5>
              </Card.Header>
              {passwordMessage && (
                <Alert variant="success">{passwordMessage}</Alert>
              )}
              {passwordError && <Alert variant="danger">{passwordError}</Alert>}
              <Form onSubmit={handleChangePassword}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3 mt-4">
                      <Form.Label>Old Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter old password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3 mt-4">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3 mt-5">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter confirmed password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Form.Group>

                <Button variant="success" type="submit">
                  Change Password
                </Button>
              </Form>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
