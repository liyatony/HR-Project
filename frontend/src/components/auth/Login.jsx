// src/components/auth/Login.jsx
import React, { useState } from "react";
import { FaEnvelope, FaLock, FaRegEyeSlash, FaEye, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import "../../styles/auth.css";
import { useAuth } from "../../utils/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUser, setMfaUser] = useState(null);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const submitCredentials = async () => {
    setError(""); 
    setLoading(true);
    try {
      const resp = await axiosInstance.post("/auth/login", { 
        email: email.trim(), 
        password 
      });
      
      if (resp.data.mfaRequired) {
        setMfaRequired(true);
        setMfaUser(resp.data.user);
      } else if (resp.data.success) {
        const { token, user } = resp.data;
        login(user, token, rememberMe);
        redirectByRole(user.role);
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        if (status === 423) {
          setError(data.message || "Account locked");
        } else {
          setError(data.message || "Login failed");
        }
      } else {
        setError("Cannot connect to server");
      }
    } finally { 
      setLoading(false); 
    }
  };

  const submitOtp = async () => {
    setLoading(true); 
    setError("");
    try {
      const resp = await axiosInstance.post("/auth/mfa/verify", { 
        userId: mfaUser.id, 
        otp 
      });
      
      if (resp.data.success) {
        const { token, user } = resp.data;
        login(user, token, rememberMe);
        redirectByRole(user.role);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("MFA verification failed");
      }
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mfaRequired) {
      submitOtp();
    } else {
      submitCredentials();
    }
  };

  const redirectByRole = (role) => {
    switch (role) {
      case "admin":
        navigate("/dashboard");
        break;
      case "dpt_head":
        navigate("/dept-head-dashboard");
        break;
      case "employee":
        navigate("/employee-dashboard");
        break;
      default:
        navigate("/dashboard");
    }
  };

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
        <h1 className="welcome-text">Welcome Back</h1>
        <p className="subtitle">Sign in to access your account</p>

        {error && (
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {!mfaRequired ? (
            <>
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

              <div className="form-group">
                <label>Password</label>
                <div className="input-icon">
                  <FaLock className="icon" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    disabled={loading}
                  />
                  <span 
                    className="toggle-password" 
                    onClick={() => !loading && setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaRegEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              <div className="form-footer">
                <label className="remember-me">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                    disabled={loading}
                  /> 
                  Remember me
                </label>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Enter OTP</label>
                <div className="input-icon">
                  <input 
                    type="text" 
                    placeholder="6-digit code" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    required 
                    disabled={loading}
                    maxLength={6}
                  />
                </div>
                <p className="mfa-hint">
                  Enter code sent to <b>{mfaUser?.email}</b>
                </p>
              </div>
            </>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading 
              ? "Processing..." 
              : mfaRequired 
              ? "Verify OTP" 
              : "Sign In"
            }
          </button>
        </form>

        {mfaRequired && (
          <button 
            className="btn-text" 
            onClick={() => {
              setMfaRequired(false);
              setMfaUser(null);
              setOtp("");
              setError("");
            }}
            style={{ 
              marginTop: '1rem', 
              width: '100%', 
              textAlign: 'center',
              color: '#4f46e5',
              cursor: 'pointer',
              background: 'none',
              border: 'none'
            }}
          >
            Back to login
          </button>
        )}
      </div>
    </div>
  );
};

export default Login;