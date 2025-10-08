import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiRequest from "../../utils/apiRequest";
import useAuthStore from "../../utils/authStore";

const Login = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setCurrentUser } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      // Endpoint matches: router.post("/auth/login", loginUser);
      const res = await apiRequest.post("/users/auth/login", data); 
      
      setCurrentUser(res.data);
      navigate("/");
    } catch (err) {
      // Assuming error structure is consistent (err.response.data.message)
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <form key="loginForm" onSubmit={handleSubmit} className="auth-form">
      <div className="formGroup">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          placeholder="Email"
          required
          name="email"
          id="email"
        />
      </div>
      <div className="formGroup">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="Password"
          required
          name="password"
          id="password"
        />
      </div>
      <p className="forgot-password">
        {/* Link to the new Forgot Password route */}
        <Link to={"/password/forgot"}>Forgot your password?</Link>
      </p>
      <button type="submit">Login</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default Login;