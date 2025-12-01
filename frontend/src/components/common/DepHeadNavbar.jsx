// src/components/common/Navbar.jsx
import React from "react";
import { useAuth } from "../../utils/AuthContext";
const Navbar = ({ toggleSidebar, pageTitle, pageSubtitle }) => {
     const { user, logout } = useAuth();

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button className="toggle-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <div className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
        <div className="page-title">
          <h1>{pageTitle}</h1>
          <p className="page-subtitle">{pageSubtitle}</p>
        </div>
      </div>

      <div className="navbar-right">
        <div className="user-profile">
          <img 
            src="https://ui-avatars.com/api/?name=Admin+User&background=4f46e5&color=fff" 
            alt="Admin" 
            className="profile-img"
          />
          <div className="profile-info">
            <span className="profile-name">{user?.department || 'Department'} </span>
            <span className="profile-role">DEPARTMENT HEAD</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;





// // src/components/common/Navbar.jsx
// import React from "react";
// import { FaBars, FaBell, FaSearch } from "react-icons/fa";

// const Navbar = ({ toggleSidebar, pageTitle, pageSubtitle }) => {
//   return (
//     <header className="top-navbar">
//       <div className="navbar-left">
//         <button className="toggle-btn" onClick={toggleSidebar}>
//           <FaBars />
//         </button>
//         <div className="page-title">
//           <h1>{pageTitle}</h1>
//           <p className="page-subtitle">{pageSubtitle}</p>
//         </div>
//       </div>

//       <div className="navbar-right">
//         <div className="search-box">
//           <FaSearch className="search-icon" />
//           <input type="text" placeholder="Search..." />
//         </div>
        
//         <button className="icon-btn notification-btn">
//           <FaBell />
//           <span className="badge">3</span>
//         </button>

//         <div className="user-profile">
//           <img 
//             src="https://ui-avatars.com/api/?name=Admin+User&background=4f46e5&color=fff" 
//             alt="Admin" 
//             className="profile-img"
//           />
//           <div className="profile-info">
//             <span className="profile-name">Admin User</span>
//             <span className="profile-role">HR Manager</span>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;


