import React from "react";
import "./RegisterPage.css";
const Loginnavbar = ({ logo }) => {
  return (
    <div className="navbar">
      {/* <div className="logo">
        <img
          src="/Erpfavico.jpg"
          alt="VISITAL"
          style={{ width: "80px", paddingLeft: "20px" , marginTop:"-10px" }}
        />

        <h2>VISITAL</h2>
      </div> */}
      <div className="logo" style={{ display: "flex", alignItems: "center" }}>
        <img
          src="/Erpfavico.jpg"
          alt="VEW"
          style={{ width: "50px", marginRight: "10px", marginTop: "-5px" }}
        />
        <h2 style={{ margin: "-3PX ", marginLeft: "10PX" }}>VEW</h2>
      </div>

      <ul>
        <li>
          <a href="/aboutus">About Us</a>
        </li>
        <li>
          <a href="/terms_and_conditions">Terms and Condtions</a>
        </li>
        <li>
          <a
            style={{
              border: "none",
            }}
            href="/Privacy_policy"
          >
            Privacy Policy
          </a>
        </li>
        <li>
          {" "}
          <select className="custom-select">
            <option>ARABIC</option>
            <option>CHINESE</option>
            <option>DANISH</option>
            <option>GERMAN</option>
            <option selected>ENGLISH</option>
            <option>SPANISH</option>
            <option>FRENCH</option>
            <option>HEBREW</option>
            <option>ITALIAN</option>
            <option>JAPANESE</option>
            <option>DUTCH</option>
            <option>POLISH</option>
            <option>PORTUGUESE</option>
            <option>RUSSIAN</option>
            <option>TURKISH</option>
            <option>PORTUGUESE (BRAZIL)</option>
          </select>
        </li>
      </ul>
    </div>
  );
};

export default Loginnavbar;
