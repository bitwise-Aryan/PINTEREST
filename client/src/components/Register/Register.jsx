import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../utils/apiRequest";

const Register = () => { // Removed setIsRegister prop, handling is in AuthPage
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    // Basic client-side validation check for all required fields
    if (!data.username || !data.displayName || !data.email || !data.password || !data.phone || !data.verificationMethod) {
        setError("All fields (including phone and verification method) are required!");
        return;
    }

    try {
      // Assuming your backend expects the phone number without the +91 prefix 
      // or that the backend handles adding the country code if necessary.
      // If the backend needs +91, you might prepend it here: 
      // data.phone = `+91${data.phone}`; 
      
      // Endpoint matches: router.post("/auth/register", registerUser);
      const res = await apiRequest.post("/users/auth/register", data);

      // Extract verification details from response or form data
      const verificationEmail = res.data.email || data.email;
      const verificationPhone = res.data.phone || data.phone; 
      
      // Redirect to OTP verification page
      navigate(`/otp-verification/${verificationEmail}/${verificationPhone}`);

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <form key="register" onSubmit={handleSubmit} className="auth-form">
      {/* --- Existing Fields --- */}
      <div className="formGroup">
        <label htmlFor="username">Username</label>
        <input type="text" placeholder="Username" required name="username" id="username" />
      </div>
      <div className="formGroup">
        <label htmlFor="displayName">Name</label>
        <input type="text" placeholder="Name" required name="displayName" id="displayName" />
      </div>
      <div className="formGroup">
        <label htmlFor="email">Email</label>
        <input type="email" placeholder="Email" required name="email" id="email" />
      </div>
      <div className="formGroup">
        <label htmlFor="password">Password</label>
        <input type="password" placeholder="Password" required name="password" id="password" />
      </div>

      {/* --- NEW FIELD: Phone --- */}
      <div className="formGroup">
        <label htmlFor="phone">Phone</label>
        <input 
          type="text" // Using text to avoid browser weirdness, but enforce digits if needed
          placeholder="Phone Number" 
          required 
          name="phone" 
          id="phone" 
        />
      </div>

      {/* --- NEW FIELD: Verification Method --- */}
      <div className="verification-method formGroup">
          <p>Select Verification Method</p>
          <div className="wrapper">
              <label>
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="email"
                    required
                  />
                  Email
              </label>
              <label>
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="phone"
                    required
                  />
                  Phone
              </label>
          </div>
      </div>
      
      <button type="submit">Register</button>
      {/* Display the error message including the custom prompt */}
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default Register;