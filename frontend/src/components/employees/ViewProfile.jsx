import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiHome,
  FiUser,
  FiClock,
  FiClipboard,
  FiFileText,
  FiDownload,
  FiLogOut,
  FiMenu
} from "react-icons/fi";

import "../../styles/profile.css";
import "../../styles/dashboard.css";
import { useAuth } from "../../utils/AuthContext";
import EmployeeSidebar from "../common/EmployeeSidebar";

const ViewProfile = () => {
  const [profile, setProfile] = useState(null);
  const [id, setId] = useState(null);

  // SIDEBAR STATE
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navigate = useNavigate();

  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      setId(user?.employeeId)
    }
  }, [user])


  // READ CORRECT KEY
  // const id = localStorage.getItem("employeeId");

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:4300/employee/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setProfile(data);
        })
        .catch((err) => console.error("Error fetching profile:", err));
    }
  }, [id]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="dashboard-wrapper">

      {/* OVERLAY */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <EmployeeSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

     

      {/* MAIN CONTENT */}
      <div className="main-wrapper">
        <header className="top-navbar">
          <div className="navbar-left">
            <button className="toggle-btn" onClick={toggleSidebar}>
              <FiMenu />
            </button>

            <div className="page-title">
              <h1>Your Profile</h1>
              
            </div>
          </div>

          <div className="navbar-right">
            <div className="user-profile">
              <img
                src="https://ui-avatars.com/api/?name=Employee&background=4f46e5&color=fff"
                className="profile-img"
                alt="profile"
              />
              <div className="profile-info">
                <span className="profile-name">Employee Dashboard</span>
                <span className="profile-role">{user.name || ""}</span>
              </div>
            </div>
          </div>
        </header>

        {/* PROFILE CONTENT */}
        <div className="vp-container">

          <div className="vp-h-card">

            {/* LEFT SIDE IMAGE */}
            <div className="vp-h-left">
            

              <h2 className="vp-h-name">{profile.name}</h2>
              <p className="vp-h-position">{profile.position}</p>
            </div>

            {/* RIGHT SIDE DETAILS */}
            <div className="vp-h-right">

              <div className="vp-h-row">
                <span>Email</span>
                <p>{profile.email}</p>
              </div>

              <div className="vp-h-row">
                <span>Phone</span>
                <p>{profile.phone}</p>
              </div>

              <div className="vp-h-row">
                <span>Department</span>
                <p>{profile.department}</p>
              </div>

              <div className="vp-h-row">
                <span>Position</span>
                <p>{profile.position}</p>
              </div>

              <div className="vp-h-row">
                <span>Date of Joining</span>
                <p>{new Date(profile.dateOfJoining).toLocaleDateString()}</p>
              </div>

              <div className="vp-h-row">
                <span>Salary</span>
                <p>₹ {profile.salary}</p>
              </div>

              <div className="vp-h-row">
                <span>Role</span>
                <p>{profile.role}</p>
              </div>

              <div className="vp-h-row">
                <span>Status</span>
                <p className={profile.active ? "vp-active" : "vp-inactive"}>
                  {profile.active ? "Active" : "Inactive"}
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>

  );
};

export default ViewProfile;
