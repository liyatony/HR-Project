// src/components/common/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import { 
  FaUsers, 
  FaCalendarCheck, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaTachometerAlt, 
  FaClipboardList,
  FaFileAlt,
  FaSignOutAlt, 
  FaTimes,
  FaUser,
  FaFileInvoiceDollar
} from "react-icons/fa";

const Sidebar = ({ isOpen, toggleSidebar, activeMenu, setActiveMenu }) => {
  const { user, logout } = useAuth();
  
  // Define menu items based on role
  const getMenuItems = () => {
    if (user?.role === "admin") {
      return [
        { id: "dashboard", label: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
        { id: "employees", label: "Employees", icon: <FaUsers />, path: "/employees" },
        { id: "attendance", label: "Attendance", icon: <FaCalendarCheck />, path: "/admin/attendance" },
        { id: "leaves", label: "Leave Management", icon: <FaClipboardList />, path: "/admin/leave-management" },
        { id: "payroll", label: "Payroll", icon: <FaMoneyBillWave />, path: "/admin/payroll" },
        { id: "performance", label: "Performance", icon: <FaChartLine />, path: "/admin/performance" },
       
      ];
    } else if (user?.role === "dpt_head") {
      return [
        { id: "dashboard", label: "Dashboard", icon: <FaTachometerAlt />, path: "/dept-head-dashboard" },
        { id: "team", label: "My Team", icon: <FaUsers />, path: "/dept-head/team" },
        { id: "attendance", label: "Team Attendance", icon: <FaCalendarCheck />, path: "/dept-head/attendance" },
        { id: "leaves", label: "Leave Requests", icon: <FaClipboardList />, path: "/dept-head/leave-requests" },
        { id: "performance", label: "Team Performance", icon: <FaChartLine />, path: "/dept-head/performance" },
      ];
    } else if (user?.role === "employee") {
      return [
        { id: "dashboard", label: "Dashboard", icon: <FaTachometerAlt />, path: "/employee-dashboard" },
        { id: "attendance", label: "My Attendance", icon: <FaCalendarCheck />, path: "/employee/attendance" },
        { id: "leaves", label: "Leave Requests", icon: <FaClipboardList />, path: "/employee/leaves" },
        { id: "payslips", label: "My Payslips", icon: <FaFileInvoiceDollar />, path: "/employee/payslips" },
        { id: "profile", label: "My Profile", icon: <FaUser />, path: "/employee/profile" },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  const getRoleColor = () => {
    if (user?.role === "admin") return "linear-gradient(135deg, #4f46e5, #7c3aed)";
    if (user?.role === "dpt_head") return "linear-gradient(135deg, #ea580c, #dc2626)";
    return "linear-gradient(135deg, #059669, #10b981)";
  };

  const getRoleLabel = () => {
    if (user?.role === "admin") return "Administrator";
    if (user?.role === "dpt_head") return `${user?.department || ''} Head`;
    return "Employee";
  };

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
            background: getRoleColor(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.875rem'
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontWeight: '600', 
              fontSize: '0.875rem',
              color: '#1f2937',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user?.name || 'User'}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {getRoleLabel()}
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
              if (setActiveMenu) setActiveMenu(item.id);
              if (window.innerWidth < 768) toggleSidebar();
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

export default Sidebar;