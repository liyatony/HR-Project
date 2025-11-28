// src/components/employee/EmployeeList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Typography,
} from "@mui/material";
import {
  Search,
  FilterList,
  FileDownload,
  PersonAdd,
  Visibility,
} from "@mui/icons-material";
import Sidebar from "../common/Sidebar";
import Navbar from "../common/Navbar";
import Loading from "../common/Loading";
import Add_employee from "./Add_employee";
import axiosInstance from "../../utils/axiosInstance";

import { useAuth } from "../../utils/AuthContext";


const EmployeeList = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const departments = ["IT", "Sales", "Marketing", "Operations"];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching employees from: /emp/employees");
      const response = await axiosInstance.get("/emp/employees");
      
      console.log("Employees response:", response.data);
      
      if (response.data.success) {
        setEmployees(response.data.data || []);
      } else {
        setError("Failed to fetch employees");
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployeeSuccess = () => {
    setShowAddEmployee(false);
    fetchEmployees();
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === "all" || emp.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        <Sidebar
          isOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="main-wrapper">
          <Navbar
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            pageTitle="Employee Management"
            pageSubtitle="Manage your workforce"
          />
          <main className="content-area">
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Loading />
            </Box>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-wrapper">
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        <Sidebar
          isOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="main-wrapper">
          <Navbar
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            pageTitle="Employee Management"
            pageSubtitle="Manage your workforce"
          />
          <main className="content-area">
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography color="error" variant="h6">
                {error}
              </Typography>
              <Button 
                variant="contained" 
                onClick={fetchEmployees}
                sx={{ mt: 2 }}
              >
                Retry
              </Button>
            </Box>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="main-wrapper">
        <Navbar
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          pageTitle="Employee Management"
          pageSubtitle="Manage your workforce"
        />

        <main className="content-area">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                size="small"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  displayEmpty
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterList />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Add_employee
                isOpen={showAddEmployee}
                onClose={() => setShowAddEmployee(false)}
                onSubmit={handleAddEmployeeSuccess}
              />

              <Button variant="outlined" startIcon={<FileDownload />}>
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => setShowAddEmployee(true)}
              >
                Add Employee
              </Button>
            </Box>
          </Box>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e5e7eb",
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  fontWeight: "500",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Total Employees
              </p>
              <h3
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#1f2937",
                  margin: "0.5rem 0 0 0",
                }}
              >
                {employees.length}
              </h3>
            </div>

            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e5e7eb",
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  fontWeight: "500",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Active
              </p>
              <h3
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#059669",
                  margin: "0.5rem 0 0 0",
                }}
              >
                {employees.filter((e) => e.active === true).length}
              </h3>
            </div>

            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e5e7eb",
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  fontWeight: "500",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Departments
              </p>
              <h3
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#1f2937",
                  margin: "0.5rem 0 0 0",
                }}
              >
                {departments.length}
              </h3>
            </div>
          </div>

          <TableContainer component={Paper} sx={{ boxShadow: 1, mt: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, px: 4 }}>
                    Employee
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Employee ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Joining Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee._id} hover>
                    <TableCell sx={{ px: 4 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          alt={employee.name}
                          src={employee.image ? `http://localhost:4300/${employee.image}` : undefined}
                          sx={{
                            width: 40,
                            height: 40,
                            background: !employee.image ? 
                              "linear-gradient(135deg, #4f46e5, #7c3aed)" : undefined,
                            fontWeight: 600,
                          }}
                        >
                          {!employee.image && getInitials(employee.name)}
                        </Avatar>
                        <Typography sx={{ fontWeight: 600 }}>
                          {employee.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{employee._id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <Chip
                        label={employee.department}
                        size="small"
                        sx={{ bgcolor: "#f1f5f9", color: "#475569" }}
                      />
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {employee.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {employee.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(employee.dateOfJoining).toLocaleDateString("en-US")}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.active ? "Active" : "Inactive"}
                        size="small"
                        color={employee.active ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() =>
                            navigate(`/employees/profile/${employee._id}`, {
                              state: { employee },
                            })
                          }
                          title="View Profile"
                        >
                          <Visibility />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredEmployees.length === 0 && (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No employees found
                </Typography>
              </Box>
            )}
          </TableContainer>
        </main>
      </div>
    </div>
  );
};

export default EmployeeList;