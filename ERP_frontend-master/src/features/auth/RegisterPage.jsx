import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./RegisterPage.css";
import Loginnavbar from "./Loginnavbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
// import { login } from "../../redux/slices/authSlice"; 
import { login } from "../../redux/slices/authSlice";
export default function Register() {
   const navigate = useNavigate();
    const dispatch = useDispatch(); 
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  if (!form.agree) {
    setError("You must agree to the Terms and Privacy Policy!");
    return;
  }

  try {
    setLoading(true);
    const { data } = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: form.name,
      email: form.email,
      password: form.password,
      confirm_password: form.confirmPassword, // 🔥 must be confirm_password
      lang: "en", // 🔥 required by backend
    });

    if (data?.user) {
      // setSuccess(data.message || "Registration successful!");
      //  localStorage.setItem("user", JSON.stringify(data.user));
      //  dispatch(login(data.user));
      //   navigate("/login", { replace: true });
       navigate("/login", { replace: true });
      // setForm({
      //   name: "",
      //   email: "",
      //   password: "",
      //   confirmPassword: "",
      //   agree: false,
      // });
    }
  } catch (err) {
    console.error("Registration error:", err); // 🔍 debug
  setError(
    err.response?.data?.message ||
    err.message ||
    "Registration failed. Please try again later."
  );
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="register-container">
      {/* Navbar */}
      <div
        style={{
          position: "fixed",
          top: "0px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: "1000",
        }}
      >
        <Loginnavbar logo={images?.logo ? `${BASE_URL}/${images.logo}` : ""} />
      </div>

      {/* Main Section */}
      <div className="main-content">
        {/* Left Illustration */}
        <div className="illustration left">
          {images?.homescreen_left_image && (
            <img
              src={`${BASE_URL}/${images.homescreen_left_image}`}
              alt="Left Illustration"
            />
          )}
        </div>

        {/* Register Form */}
        <div className="form-section">
          <form className="register-form" onSubmit={handleSubmit}>
            <h2>Register</h2>

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <strong>Name</strong>
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <strong>Email</strong>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <strong>Password</strong>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <strong>Password Confirmation</strong>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Enter Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            <div className="checkboxwithstatement">
              <input
                type="checkbox"
                id="agree"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
              />
              <label htmlFor="agree">
                I agree to the
                <a href="/terms_and_conditions">&nbsp;Terms and Conditions</a>
                &nbsp;and&nbsp;
                <a href="/Privacy_policy">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>

            <p className="login-text">
              Already have an account? <a href="/login">Login</a>
            </p>
          </form>
          <p>© 2025 Visital</p>
        </div>

        {/* Right Illustration */}
        <div className="illustration2 right">
          {images?.homescreen_right_image && (
            <img
              src={`${BASE_URL}/${images.homescreen_right_image}`}
              alt="Right Illustration"
            />
          )}
        </div>
      </div>
    </div>
  );
}
