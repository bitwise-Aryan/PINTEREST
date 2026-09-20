import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../utils/apiRequest";

const Register = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    const username = (data.username || "").trim();
    const displayName = (data.displayName || "").trim();
    const email = (data.email || "").trim().toLowerCase();
    const password = (data.password || "").trim();

    if (!username || !displayName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiRequest.post("/users/auth/register", {
        username,
        displayName,
        email,
        password,
      });

      const targetEmail = res.data.email || email;
      navigate(`/otp-verification/${encodeURIComponent(targetEmail)}`);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form key="register" onSubmit={handleSubmit} className="auth-form">
      <div className="formGroup">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          placeholder="Choose a unique username"
          required
          name="username"
          id="username"
          disabled={isLoading}
        />
      </div>

      <div className="formGroup">
        <label htmlFor="displayName">Full Name</label>
        <input
          type="text"
          placeholder="Your full name"
          required
          name="displayName"
          id="displayName"
          disabled={isLoading}
        />
      </div>

      <div className="formGroup">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          placeholder="name@example.com"
          required
          name="email"
          id="email"
          disabled={isLoading}
        />
      </div>

      <div className="formGroup">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="At least 6 characters"
          required
          name="password"
          id="password"
          disabled={isLoading}
        />
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Sending verification code..." : "Sign Up with Email"}
      </button>

      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default Register;