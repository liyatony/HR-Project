// src/components/common/DeptHeadSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import { 
  FaUsers, 
  FaCalendarCheck, 
  FaChartLine, 
  FaTachometerAlt, 
  FaClipboardList,
  FaSignOutAlt, 
  FaTimes 
} from "react-icons/fa";

const DeptHeadSidebar = ({ isOpen, toggleSidebar, activeMenu, setActiveMenu }) => {
  const { user, logout } = useAuth();
  
  const menuItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: <FaTachometerAlt />, 
      path: "/dept-head-dashboard" 
    },
    { 
      id: "team", 
      label: "My Team", 
      icon: <FaUsers />, 
      path: "/dept-head/team" 
    },
    { 
      id: "attendance", 
      label: "Team Attendance", 
      icon: <FaCalendarCheck />, 
      path: "/dept-head/attendance" 
    },
    { 
      id: "leaves", 
      label: "Leave Requests", 
      icon: <FaClipboardList />, 
      path: "/dept-head/leave-requests" 
    },
    { 
      id: "performance", 
      label: "Team Performance", 
      icon: <FaChartLine />, 
      path: "/dept-head/performance" 
    },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">HR</div>
          <h2 className="logo-text">TECHNEXIA</h2>
        </div>
        <button className="close-sidebar" onClick={toggleSidebar}>
          <FaTimes />
        </button>
      </div>

      {/* User Info */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ea580c, #dc2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.875rem'
          }}>
            {user?.name?.charAt(0) || 'D'}
          </div>
          <div>
            <div style={{ 
              fontWeight: '600', 
              fontSize: '0.875rem',
              color: '#1f2937'
            }}>
              {user?.name || 'Dept Head'}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280'
            }}>
              {user?.department || 'Department'} Head
            </div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={() => {
              setActiveMenu(item.id);
              toggleSidebar();
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="nav-item logout" onClick={logout}>
          <span className="nav-icon"><FaSignOutAlt /></span>
          <span className="nav-label">Logout</span>
        </div>
      </div>
    </aside>
  );
};

export default DeptHeadSidebar;