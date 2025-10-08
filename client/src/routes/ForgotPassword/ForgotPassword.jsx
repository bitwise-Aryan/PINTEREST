// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import apiRequest from "../../utils/apiRequest";
// // Assuming you have a toast library like react-toastify for non-form errors
// // import { toast } from "react-toastify"; 

// const ForgotPassword = () => {
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   const handleForgotPassword = async (e) => {
//     e.preventDefault();
//     setError("");
//     setMessage("");

//     try {
//       // Endpoint matches: router.post("/auth/password/forgot", forgotPassword);
//       const res = await apiRequest.post("/users/auth/password/forgot", { email });

//       setMessage(res.data.message || "Password reset link sent to your email.");
//       setEmail(""); // Clear input
//     } catch (err) {
//       setError(err.response?.data?.message || "Error sending reset link. Check your email.");
//     }
//   };

//   return (
//     <div className="authPage">
//       <div className="authContainer">
//         <h2>Forgot Password</h2>
//         <p>Enter your email address to receive a password reset link.</p>
//         <form onSubmit={handleForgotPassword} className="forgot-password-form">
//           <input
//             type="email"
//             placeholder="Enter your email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             className="forgot-input"
//           />
//           <button type="submit" className="forgot-btn">
//             Send Reset Link
//           </button>
//         </form>
//         {message && <p className="success-message">{message}</p>}
//         {error && <p className="error">{error}</p>}
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../utils/apiRequest";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await apiRequest.post("/users/auth/password/forgot", { email });

      if (res.data.success) {
        setMessage(res.data.message || "Password reset link sent to your email.");
        setEmail(""); // Clear input
        
        // Optional: Redirect to login after 5 seconds
        // setTimeout(() => navigate("/auth"), 5000);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.response?.data?.message || "Error sending reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authContainer">
        <h2>Forgot Password</h2>
        <p>Enter your email address to receive a password reset link.</p>
        
        <form onSubmit={handleForgotPassword} className="forgot-password-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="forgot-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="forgot-btn"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        
        {message && (
          <div className="success-message" style={{ marginTop: "15px" }}>
            <p>{message}</p>
            <p style={{ fontSize: "14px", marginTop: "10px" }}>
              Check your email inbox (and spam folder) for the reset link.
            </p>
          </div>
        )}
        
        {error && <p className="error">{error}</p>}
        
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button 
            onClick={() => navigate("/auth")} 
            className="link-button"
            style={{ background: "none", border: "none", color: "#4CAF50", cursor: "pointer", textDecoration: "underline" }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;