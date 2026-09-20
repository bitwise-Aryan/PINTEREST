import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiRequest from "../../utils/apiRequest";
import useAuthStore from "../../utils/authStore";

const Login = () => {
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail(null);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    const email = (data.email || "").trim().toLowerCase();
    const password = (data.password || "").trim();

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiRequest.post("/users/auth/login", { email, password });
      
      // Correctly set the user object in state
      const userData = res.data.user || res.data;
      setCurrentUser(userData);
      navigate("/");
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.accountVerified === false || respData?.message?.toLowerCase().includes("not verified")) {
        setUnverifiedEmail(respData?.email || email);
        setError(respData?.message || "Your account has not been verified yet.");
      } else {
        setError(respData?.message || "Invalid email or password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToVerify = async () => {
    if (!unverifiedEmail) return;
    try {
      // Trigger a fresh OTP to the email
      await apiRequest.post("/users/auth/resend-otp", { email: unverifiedEmail });
    } catch (err) {
      console.warn("Auto resend on redirect failed:", err);
    }
    navigate(`/otp-verification/${encodeURIComponent(unverifiedEmail)}`);
  };

  return (
    <form key="loginForm" onSubmit={handleSubmit} className="auth-form">
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
          placeholder="Your password"
          required
          name="password"
          id="password"
          disabled={isLoading}
        />
      </div>

      <p className="forgot-password">
        <Link to={"/password/forgot"}>Forgot your password?</Link>
      </p>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>

      {error && <p className="error">{error}</p>}

      {unverifiedEmail && (
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <button
            type="button"
            onClick={handleGoToVerify}
            style={{
              background: "#e60023",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Verify Email Now
          </button>
        </div>
      )}
    </form>
  );
};

export default Login;