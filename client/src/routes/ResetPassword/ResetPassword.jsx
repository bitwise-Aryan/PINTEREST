// import React, { useState } from "react";
// import { Navigate, useParams, useNavigate } from "react-router-dom";
// import apiRequest from "../../utils/apiRequest";
// import useAuthStore from "../../utils/authStore";

// const ResetPassword = () => {
//   const { setCurrentUser, currentUser } = useAuthStore();
//   const { token } = useParams(); // Get the reset token from the URL
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   if (currentUser) {
//     return <Navigate to={"/"} />;
//   }

//   const handleResetPassword = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (password !== confirmPassword) {
//       setError("Passwords do not match.");
//       return;
//     }

//     try {
//       // Endpoint matches: router.put("/auth/password/reset/:token", resetPassword);
//       const res = await apiRequest.put(
//         `/users/auth/password/reset/${token}`,
//         { password, confirmPassword }
//       );
      
//       // On successful reset, the backend might log the user in and return user data
//       setCurrentUser(res.data.user); 
//       // alert(res.data.message || "Password reset successful!"); // Use toast for better UX
//       navigate("/");
//     } catch (err) {
//       setError(err.response?.data?.message || "Password reset failed. The token may be invalid or expired.");
//       setCurrentUser(null);
//     }
//   };

//   return (
//     <div className="reset-password-page authPage">
//       <div className="reset-password-container authContainer">
//         <h2>Reset Password</h2>
//         <p>Enter and confirm your new password below.</p>
//         <form className="reset-password-form" onSubmit={handleResetPassword}>
//           <input
//             type="password"
//             placeholder="New Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             className="reset-input"
//           />
//           <input
//             type="password"
//             placeholder="Confirm New Password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             required
//             className="reset-input"
//           />
//           <button type="submit" className="reset-btn">
//             Reset Password
//           </button>
//         </form>
//         {error && <p className="error">{error}</p>}
//       </div>
//     </div>
//   );
// };

// export default ResetPassword;

import React, { useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import apiRequest from "../../utils/apiRequest";
import useAuthStore from "../../utils/authStore";

const styles = {
    page: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f5f6fa",
        fontFamily: "Arial, sans-serif"
    },
    container: {
        background: "#ffffff",
        borderRadius: "8px",
        padding: "24px",
        maxWidth: "400px",
        width: "100%",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    },
    title: {
        fontSize: "24px",
        marginBottom: "8px",
        textAlign: "center",
        color: "#333"
    },
    subtitle: {
        fontSize: "14px",
        textAlign: "center",
        marginBottom: "20px",
        color: "#555"
    },
    input: {
        width: "100%",
        padding: "10px",
        marginBottom: "12px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        fontSize: "14px"
    },
    button: {
        width: "100%",
        padding: "10px",
        background: "linear-gradient(135deg, #B88955 0%, #260000 100%)",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "16px",
        transition: "opacity 0.3s ease"
    },
    buttonDisabled: {
        background: "linear-gradient(135deg, #B88955 0%, #260000 100%)",
        opacity: 0.6,
        cursor: "not-allowed"
    },
    error: {
        color: "#e74c3c",
        fontSize: "14px",
        marginTop: "10px",
        textAlign: "center"
    },
    success: {
        color: "#27ae60",
        fontSize: "14px",
        marginTop: "10px",
        textAlign: "center"
    }
};

const ResetPassword = () => {
    const { setCurrentUser, currentUser } = useAuthStore();
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (currentUser) {
        return <Navigate to={"/"} />;
    }

    if (!token) {
        return (
            <div style={styles.page}>
                <div style={styles.container}>
                    <p style={styles.error}>Error: Missing reset token.</p>
                </div>
            </div>
        );
    }

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await apiRequest.put(
                `/users/auth/password/reset/${token}`,
                { password, confirmPassword }
            );

            setCurrentUser(res.data.user);
            setMessage(res.data.message || "Password reset successful! Redirecting...");
            setTimeout(() => navigate("/"), 1500);
        } catch (err) {
            setCurrentUser(null);
            setError(err.response?.data?.message || "Password reset failed. The token may be invalid or expired.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h2 style={styles.title}>Reset Password</h2>
                <p style={styles.subtitle}>Enter and confirm your new password below.</p>

                <form onSubmit={handleResetPassword}>
                    <input
                        type="password"
                        placeholder="New Password (min 6 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                        style={styles.input}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            ...styles.button,
                            ...(isSubmitting ? styles.buttonDisabled : {})
                        }}
                    >
                        {isSubmitting ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                {message && <p style={styles.success}>{message}</p>}
                {error && <p style={styles.error}>{error}</p>}
            </div>
        </div>
    );
};

export default ResetPassword;
