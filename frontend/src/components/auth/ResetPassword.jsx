// src/components/auth/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { FaLock, FaRegEyeSlash, FaEye, FaCheckCircle, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import "../../styles/auth.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    if (!token || !email) {
      setError("Invalid reset link");
      setVerifying(false);
      return;
    }

    try {
      const response = await axiosInstance.get("/auth/verify-reset-token", {
        params: { token, email }
      });

      if (response.data.success) {
        setTokenValid(true);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Invalid or expired reset link");
      } else {
        setError("Failed to verify reset link");
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/reset-password", {
        token,
        email,
        newPassword
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Failed to reset password");
      } else {
        setError("Cannot connect to server. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Verifying token
  if (verifying) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <FaSpinner className="fa-spin" style={{ fontSize: '3rem', color: '#4f46e5' }} />
            <p style={{ marginTop: '1rem', color: '#666' }}>Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token
  if (!tokenValid) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="error-message-container">
            <FaExclamationTriangle className="error-icon-large" />
            <h2 className="error-title">Invalid Reset Link</h2>
            <p className="error-text">{error || "This password reset link is invalid or has expired."}</p>
            <p className="error-subtext">
              Please request a new password reset link.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Link to="/forgot-password" className="login-btn" style={{ flex: 1 }}>
                Request New Link
              </Link>
              <Link to="/login" className="login-btn" style={{ flex: 1, background: '#6c757d' }}>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="success-message-container">
            <FaCheckCircle className="success-icon-large" />
            <h2 className="success-title">Password Reset Successfully!</h2>
            <p className="success-text">
              Your password has been reset successfully.
            </p>
            <p className="success-subtext">
              Redirecting to login page...
            </p>
            <Link to="/login" className="login-btn" style={{ marginTop: '1.5rem' }}>
              Continue to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-box">
            <div className="logo-gradient">
              <span className="logo-text">HR</span>
            </div>
          </div>
          <h2 className="system-title">HR Management System</h2>
        </div>

        <h1 className="welcome-text">Reset Password</h1>
        <p className="subtitle">Enter your new password</p>

        {error && (
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>New Password</label>
            <div className="input-icon">
              <FaLock className="icon" />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
              <span
                className="toggle-password"
                onClick={() => !loading && setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaRegEyeSlash /> : <FaEye />}
              </span>
            </div>
            <small style={{ color: '#666', fontSize: '0.875rem' }}>
              Minimum 8 characters
            </small>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-icon">
              <FaLock className="icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
              <span
                className="toggle-password"
                onClick={() => !loading && setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaRegEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/login" className="forgot-password">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;