import React, { useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import apiRequest from "../../utils/apiRequest";
import useAuthStore from "../../utils/authStore";

const OtpVerification = () => {
  const { setCurrentUser, currentUser } = useAuthStore();
  // Get parameters from the URL path defined in main.jsx
  const { email, phone } = useParams(); 
  const [otp, setOtp] = useState(["", "", "", "", ""]); // Assuming 5-digit OTP
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (currentUser) {
    return <Navigate to={"/"} />;
  }

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setError("");
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 5) {
      setError("Please enter a valid 5-digit OTP.");
      return;
    }
    
    const data = {
      email,
      otp: enteredOtp,
      phone: phone === '0' ? undefined : phone, // Send phone only if it's a real value
    };
    
    try {
      // Endpoint matches: router.post("/auth/verify-otp", verifyOTP);
      const res = await apiRequest.post("/users/auth/verify-otp", data);
      
      // On successful verification, the backend might log the user in and return user data
      setCurrentUser(res.data.user);
      // alert(res.data.message || "OTP Verified Successfully!"); // Use toast for better UX
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed. Please try again.");
      setCurrentUser(null);
    }
  };

  return (
    <div className="otp-verification-page authPage">
      <div className="otp-container authContainer">
        <h1>OTP Verification</h1>
        <p>Enter the 5-digit OTP sent to **{email}** (or registered phone).</p>
        <form onSubmit={handleOtpVerification} className="otp-form">
          <div className="otp-input-container">
            {otp.map((digit, index) => (
              <input
                id={`otp-input-${index}`}
                type="text"
                maxLength="1"
                key={index}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="otp-input"
              />
            ))}
          </div>
          <button type="submit" className="verify-button">
            Verify OTP
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default OtpVerification;