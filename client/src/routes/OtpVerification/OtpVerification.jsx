import React, { useState, useEffect, useRef } from "react";
import { Navigate, useParams, useNavigate, useLocation, Link } from "react-router-dom";
import apiRequest from "../../utils/apiRequest";
import useAuthStore from "../../utils/authStore";

const OtpVerification = () => {
  const { setCurrentUser, currentUser } = useAuthStore();
  const params = useParams();
  const location = useLocation();
  const rawEmail = params.email || "";
  const email = decodeURIComponent(rawEmail).toLowerCase().trim();

  // If verification code is passed from registration (e.g. Render free tier SMTP blocked)
  const initialCode = location.state?.verificationCode;
  const [liveOtp, setLiveOtp] = useState(initialCode || "");

  const initialOtpArray = initialCode && String(initialCode).length === 5
    ? String(initialCode).split("")
    : ["", "", "", "", ""];

  const [otp, setOtp] = useState(initialOtpArray);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // If no initial code, attempt to fetch active OTP from backend so user is never blocked
  useEffect(() => {
    if (!liveOtp && email) {
      apiRequest.get(`/users/auth/get-otp/${encodeURIComponent(email)}`)
        .then((res) => {
          if (res.data?.verificationCode) {
            const code = String(res.data.verificationCode);
            setLiveOtp(code);
            if (code.length === 5) {
              setOtp(code.split(""));
            }
          }
        })
        .catch(() => {
          // Silent fallback if not available
        });
    }
  }, [email, liveOtp]);

  const handleAutoFill = (code) => {
    if (!code) return;
    const digits = String(code).slice(0, 5).split("");
    setOtp(digits);
    setError("");
  };

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first input on mount if not pre-filled
  useEffect(() => {
    if (initialCode) return;
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [initialCode]);

  if (currentUser) {
    return <Navigate to={"/"} replace />;
  }

  const handleChange = (value, index) => {
    // Only allow single digit
    const cleaned = value.replace(/\D/g, "");
    const char = cleaned.slice(-1);

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto-advance
    if (char && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 5; i++) {
      newOtp[i] = pasteData[i] || "";
    }
    setOtp(newOtp);

    const focusIndex = Math.min(pasteData.length, 4);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 5) {
      setError("Please enter all 5 digits of your verification code.");
      return;
    }

    if (!email) {
      setError("Missing email address. Please return to the sign up page.");
      return;
    }

    setIsVerifying(true);

    try {
      const res = await apiRequest.post("/users/auth/verify-otp", {
        email,
        otp: enteredOtp,
      });

      const userData = res.data.user || res.data;
      setCurrentUser(userData);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please check your code and try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setError("");
    setSuccessMessage("");
    setIsResending(true);

    try {
      const res = await apiRequest.post("/users/auth/resend-otp", { email });
      if (res.data?.verificationCode) {
        setLiveOtp(String(res.data.verificationCode));
        handleAutoFill(res.data.verificationCode);
      }
      setSuccessMessage(res.data?.message || "A new 5-digit verification code has been generated.");
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="otp-verification-page authPage">
      <div className="otp-container authContainer" style={{ maxWidth: "440px", width: "100%" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "600", margin: "0 0 8px 0" }}>Email Verification</h1>
        <p style={{ margin: "0 0 16px 0", color: "#555", textAlign: "center", fontSize: "14px", lineHeight: "1.5" }}>
          We sent a 5-digit code to <br />
          <strong style={{ color: "#111" }}>{email || "your email"}</strong>
        </p>

        {liveOtp && (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(230, 0, 35, 0.08) 0%, rgba(255, 51, 75, 0.12) 100%)",
              border: "1.5px dashed #e60023",
              borderRadius: "14px",
              padding: "14px 18px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.2px", fontWeight: "700", color: "#e60023", marginBottom: "4px" }}>
              ⚡ Your Verification Code
            </div>
            <div style={{ fontSize: "32px", fontWeight: "800", letterSpacing: "10px", color: "#e60023", fontFamily: "monospace", margin: "4px 0", paddingLeft: "10px" }}>
              {liveOtp}
            </div>
            <p style={{ margin: "2px 0 8px 0", fontSize: "12px", color: "#666" }}>
              Auto-filled below for instant verification.
            </p>
            <button
              type="button"
              onClick={() => handleAutoFill(liveOtp)}
              style={{
                background: "#e60023",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Auto-Fill Again
            </button>
          </div>
        )}

        <form onSubmit={handleOtpVerification} className="otp-form" style={{ width: "100%" }}>
          <div
            className="otp-input-container"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "24px",
            }}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                id={`otp-input-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                disabled={isVerifying}
                style={{
                  width: "48px",
                  height: "56px",
                  fontSize: "24px",
                  fontWeight: "700",
                  textAlign: "center",
                  borderRadius: "12px",
                  border: "2px solid #ddd",
                  outline: "none",
                  transition: "all 0.2s ease",
                  backgroundColor: digit ? "#fff" : "#fafafa",
                }}
                className="otp-input"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isVerifying || otp.join("").length !== 5}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "15px",
              borderRadius: "12px",
              cursor: isVerifying || otp.join("").length !== 5 ? "not-allowed" : "pointer",
              opacity: isVerifying || otp.join("").length !== 5 ? 0.7 : 1,
            }}
          >
            {isVerifying ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        {successMessage && (
          <p style={{ color: "#10b981", fontSize: "14px", marginTop: "12px", textAlign: "center", fontWeight: "500" }}>
            {successMessage}
          </p>
        )}

        {error && (
          <p className="error" style={{ fontSize: "14px", marginTop: "12px", textAlign: "center" }}>
            {error}
          </p>
        )}

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#666" }}>
          Didn't receive the email?{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendCooldown > 0 || isResending}
            style={{
              background: "none",
              border: "none",
              color: resendCooldown > 0 ? "#999" : "#e60023",
              fontWeight: "600",
              cursor: resendCooldown > 0 ? "default" : "pointer",
              padding: "0 4px",
              textDecoration: "underline",
              fontSize: "14px",
            }}
          >
            {isResending
              ? "Sending..."
              : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend Code"}
          </button>
        </div>

        <div style={{ marginTop: "12px", textAlign: "center" }}>
          <Link
            to="/auth"
            style={{
              fontSize: "13px",
              color: "#888",
              textDecoration: "none",
            }}
          >
            &larr; Back to Login / Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;