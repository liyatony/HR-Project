// src/components/auth/ForgotPassword.jsx
import React, { useState } from "react";
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import "../../styles/auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/forgot-password", {
        email: email.trim()
      });

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Failed to send reset email");
      } else {
        setError("Cannot connect to server. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="success-message-container">
            <FaCheckCircle className="success-icon-large" />
            <h2 className="success-title">Check Your Email</h2>
            <p className="success-text">
              If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
            <p className="success-subtext">
              Please check your inbox and spam folder. The link will expire in 1 hour.
            </p>
            <Link to="/login" className="login-btn" style={{ marginTop: '1.5rem' }}>
              <FaArrowLeft style={{ marginRight: '0.5rem' }} />
              Back to Login
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

        <h1 className="welcome-text">Forgot Password?</h1>
        <p className="subtitle">
          Enter your email address and we'll send you a link to reset your password
        </p>

        {error && (
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-icon">
              <FaEnvelope className="icon" />
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/login" className="forgot-password">
            <FaArrowLeft style={{ marginRight: '0.5rem' }} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;