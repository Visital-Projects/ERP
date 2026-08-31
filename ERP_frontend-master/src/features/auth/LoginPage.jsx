import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useDispatch } from "react-redux";
import { login, fetchUserPermissions } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import Loginnavbar from "./Loginnavbar";
// import theme3 from "../../assets/theme-3.svg";
// import common from "../../assets/common.svg";
import axios from "axios";
const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/homescreen`);
        if (data.success) {
          setImages(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch home images:", err);
      }
    };
    fetchImages();
  }, [BASE_URL]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await dispatch(login(form));

    if (result.meta.requestStatus === "fulfilled") {
      // Fetch user permissions after successful login
      await dispatch(fetchUserPermissions());
      navigate("/dashboard");
    } else {
      setError(result.payload || "Invalid credentials");
    }
  };

  return (
    // <div className="login-wrapper">
    //   <div
    //     style={{
    //       position: "fixed",
    //       top: "0px",
    //       width: "100%",
    //       display: "flex",
    //       justifyContent: "center",
    //       alignItems: "center",
    //     }}
    //   >
    //     <Loginnavbar
    //      />
    //   </div>
    //   <div className="login-card">
    //     <h2>Login</h2>

    //     <form onSubmit={handleSubmit}>
    //       <label>Email</label>
    //       <input
    //         type="email"
    //         name="email"
    //         placeholder="Enter Your Email"
    //         value={form.email}
    //         onChange={handleChange}
    //         required
    //       />

    //       <label>Password</label>
    //       <input
    //         type="password"
    //         name="password"
    //         placeholder="Enter Your Password"
    //         value={form.password}
    //         onChange={handleChange}
    //         required
    //       />

    //       {error && <p className="error-msg">{error}</p>}

    //       <div className="login-options">
    //         <a href="#" className="forgot-password">
    //           Forgot your password?
    //         </a>
    //       </div>

    //       <button type="submit" className="login-button">
    //         Login
    //       </button>
    //     </form>

    //     <p className="register-link">
    //       Don't have an account? <a href="/register">Register</a>
    //     </p>
    //   </div>
    // </div>
    <div className="login-wrapper">
      <div
        style={{
          position: "fixed",
          top: "0px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        
        <Loginnavbar logo={images?.logo ? `${BASE_URL}/${images.logo}` : ""} />
      </div>
      {/* <img className="img1" src={theme3} alt="sss" /> */}
      <div className="main-content">
        <div className="img1">
          {images?.homescreen_left_image && (
            <img
              src={`${BASE_URL}/${images.homescreen_left_image}`}
              alt="Left Illustration"
            />
          )}
          {/* <img src={theme3} alt="Illustration" /> */}
        </div>
        <div className="d-flex flex-column justify-content-center align-items-center gap-5">
          <div className="login-card">
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter Your Email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter Your Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && <p className="error-msg">{error}</p>}

              <div className="login-options">
                <a href="#" className="forgot-password">
                  Forgot your password?
                </a>
              </div>

              <button type="submit" className="login-button">
                Login
              </button>
            </form>

            <p className="register-link">
              Don't have an account? <a href="/register">Register</a>
            </p>
          </div>
          <p>© 2025 Visital</p>
        </div>
        <br />
        <div className="">
          {/* <img src={common} alt="Illustration" /> */}
          {images?.homescreen_left_image && (
            <img
              src={`${BASE_URL}/${images.homescreen_right_image}`}
              alt="Left Illustration"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
