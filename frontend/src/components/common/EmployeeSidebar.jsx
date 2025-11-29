// src/components/common/EmployeeSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import { 
  FaTachometerAlt, 
  FaCalendarCheck, 
  FaFileInvoiceDollar, 
  FaClipboardList,
  FaUser,
  FaSignOutAlt, 
  FaTimes 
} from "react-icons/fa";

const EmployeeSidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  
  // Define menu items based on role
  
const getMenuItems = () => {
  const baseMenuItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: <FaTachometerAlt />, 
      path: "/employee-dashboard" 
    },
    // ✨ NEW: Attendance submenu items
    { 
      id: "mark-attendance", 
      label: "Mark Attendance", 
      icon: <FaCalendarCheck />, 
      path: "/employee/mark-attendance" 
    },
    { 
      id: "attendance-history", 
      label: "Attendance History", 
      icon: <FaCalendarCheck />, 
      path: "/employee/attendance-history" 
    },
    // End of new items
    { 
      id: "leaves", 
      label: "Leave Requests", 
      icon: <FaClipboardList />, 
      path: "/apply-leave" 
    },
    { 
      id: "payslips", 
      label: "My Payslips", 
      icon: <FaFileInvoiceDollar />, 
      path: "/payslips" 
    },
    { 
      id: "profile", 
      label: "My Profile", 
      icon: <FaUser />, 
      path: "/employee/profile" 
    },
  ];

    // Add admin/dept_head specific items if needed
    if (user?.role === "admin" || user?.role === "dpt_head") {
      return [
        { 
          id: "dashboard", 
          label: "Dashboard", 
          icon: <FaTachometerAlt />, 
          path: "/dashboard" 
        },
        ...baseMenuItems.slice(1), // Skip employee dashboard
      ];
    }

    return baseMenuItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">HR</div>
          <h2 className="logo-text">HR System</h2>
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
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div style={{ 
              fontWeight: '600', 
              fontSize: '0.875rem',
              color: '#1f2937'
            }}>
              {user?.name || 'User'}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280',
              textTransform: 'capitalize'
            }}>
              {user?.role || 'Employee'}
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
            onClick={toggleSidebar}
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

export default EmployeeSidebar;