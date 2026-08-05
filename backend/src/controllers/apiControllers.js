const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, saveToDisk } = require('../store/dataStore');
const { queryAIAssistant } = require('../utils/aiEngine');

const JWT_SECRET = process.env.JWT_SECRET || "ethara_super_secret_jwt_key_2026";

// Helper: Pagination and filter
const paginateArray = (array, page = 1, limit = 20) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.max(1, Math.min(500, parseInt(limit)));
  const startIndex = (p - 1) * l;
  const endIndex = p * l;
  return {
    page: p,
    limit: l,
    totalRecords: array.length,
    totalPages: Math.ceil(array.length / l),
    data: array.slice(startIndex, endIndex)
  };
};

// ==========================================
// AUTH CONTROLLER
// ==========================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password credentials." });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, employeeId: user.employeeId },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const emp = db.employees.find(e => e.employeeId === user.employeeId);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        employeeDetails: emp || null
      }
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    return res.status(500).json({ success: false, message: "Internal server error during authentication." });
  }
};

const getCurrentUser = (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  
  const emp = db.employees.find(e => e.employeeId === user.employeeId);
  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      employeeDetails: emp || null
    }
  });
};

// ==========================================
// EMPLOYEES CONTROLLER
// ==========================================
const getEmployees = (req, res) => {
  try {
    let { page = 1, limit = 25, search = '', department = '', project = '', floor = '', zone = '', status = '' } = req.query;

    let result = db.employees;

    // Search term matching name, employeeId, email, seat code, department
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter(e => 
        e.name.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.assignedSeatCode && e.assignedSeatCode.toLowerCase().includes(q)) ||
        e.department.toLowerCase().includes(q)
      );
    }

    if (department) result = result.filter(e => e.department === department);
    if (project) result = result.filter(e => e.projectId === project || e.projectName === project);
    if (floor) result = result.filter(e => String(e.assignedFloor) === String(floor));
    if (zone) result = result.filter(e => e.assignedZone === zone);
    if (status) {
      if (status === 'Unallocated') {
        result = result.filter(e => !e.assignedSeatCode);
      } else {
        result = result.filter(e => e.status === status);
      }
    }

    const paginated = paginateArray(result, page, limit);
    return res.json({ success: true, ...paginated });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch employees." });
  }
};

const getEmployeeById = (req, res) => {
  const emp = db.employees.find(e => e.id === req.params.id || e.employeeId === req.params.id);
  if (!emp) return res.status(404).json({ success: false, message: "Employee not found." });
  return res.json({ success: true, employee: emp });
};

const createEmployee = (req, res) => {
  try {
    const { name, email, phone, department, designation, projectId, joiningDate, status } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and Email are required." });
    }

    const existingEmail = db.employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Employee with this email already exists." });
    }

    const newEmpId = `EMP-${1000 + db.employees.length + 1}`;
    const projectObj = db.projects.find(p => p.id === projectId) || db.projects[0];

    const newEmp = {
      id: newEmpId,
      employeeId: newEmpId,
      name,
      email,
      phone: phone || "+971 50 0000000",
      department: department || "Engineering",
      designation: designation || "Software Engineer",
      projectId: projectObj.id,
      projectName: projectObj.name,
      manager: projectObj.manager,
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      status: status || "Active",
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      assignedSeatCode: null,
      assignedFloor: null,
      assignedZone: null
    };

    projectObj.employeeCount++;
    db.employees.unshift(newEmp);

    db.activities.unshift({
      id: `ACT-${Date.now()}`,
      text: `Created new employee ${name} (${newEmpId})`,
      timestamp: "Just now",
      type: "employee"
    });

    saveToDisk();
    return res.status(201).json({ success: true, employee: newEmp, message: "Employee created successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create employee." });
  }
};

const updateEmployee = (req, res) => {
  const empIndex = db.employees.findIndex(e => e.id === req.params.id || e.employeeId === req.params.id);
  if (empIndex === -1) return res.status(404).json({ success: false, message: "Employee not found." });

  db.employees[empIndex] = { ...db.employees[empIndex], ...req.body };
  saveToDisk();
  return res.json({ success: true, employee: db.employees[empIndex], message: "Employee updated successfully." });
};

const deleteEmployee = (req, res) => {
  const empIndex = db.employees.findIndex(e => e.id === req.params.id || e.employeeId === req.params.id);
  if (empIndex === -1) return res.status(404).json({ success: false, message: "Employee not found." });

  const emp = db.employees[empIndex];
  
  // Release seat if assigned
  if (emp.assignedSeatCode) {
    const seat = db.seats.find(s => s.seatCode === emp.assignedSeatCode);
    if (seat) {
      seat.status = 'Available';
      seat.employeeId = null;
      seat.employeeName = null;
      seat.projectId = null;
      seat.projectName = null;
      seat.allocationDate = null;
    }
  }

  db.employees.splice(empIndex, 1);
  saveToDisk();
  return res.json({ success: true, message: "Employee deleted successfully." });
};

// ==========================================
// SEATS CONTROLLER
// ==========================================
const getSeats = (req, res) => {
  try {
    let { floor, zone, status, search, page = 1, limit = 100 } = req.query;
    let result = db.seats;

    if (floor) result = result.filter(s => String(s.floorNumber) === String(floor));
    if (zone) result = result.filter(s => s.zone.toLowerCase() === zone.toLowerCase());
    if (status) result = result.filter(s => s.status.toLowerCase() === status.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => 
        s.seatCode.toLowerCase().includes(q) ||
        (s.employeeName && s.employeeName.toLowerCase().includes(q)) ||
        (s.projectName && s.projectName.toLowerCase().includes(q))
      );
    }

    const paginated = paginateArray(result, page, limit);
    return res.json({ success: true, ...paginated });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch seats." });
  }
};

const assignSeat = (req, res) => {
  try {
    const { employeeId, seatCode } = req.body;
    if (!employeeId || !seatCode) {
      return res.status(400).json({ success: false, message: "Employee ID and Seat Code are required." });
    }

    const emp = db.employees.find(e => e.employeeId === employeeId || e.id === employeeId);
    if (!emp) return res.status(404).json({ success: false, message: "Employee not found." });

    const seat = db.seats.find(s => s.seatCode === seatCode || s.id === seatCode);
    if (!seat) return res.status(404).json({ success: false, message: "Seat not found." });

    if (seat.status === "Occupied" && seat.employeeId !== emp.employeeId) {
      return res.status(400).json({ success: false, message: `Seat ${seatCode} is already occupied by ${seat.employeeName}.` });
    }

    // Release old seat if employee had one
    if (emp.assignedSeatCode && emp.assignedSeatCode !== seat.seatCode) {
      const oldSeat = db.seats.find(s => s.seatCode === emp.assignedSeatCode);
      if (oldSeat) {
        oldSeat.status = 'Available';
        oldSeat.employeeId = null;
        oldSeat.employeeName = null;
        oldSeat.projectId = null;
        oldSeat.projectName = null;
        oldSeat.allocationDate = null;
      }
    }

    // Assign new seat
    seat.status = 'Occupied';
    seat.employeeId = emp.employeeId;
    seat.employeeName = emp.name;
    seat.projectId = emp.projectId;
    seat.projectName = emp.projectName;
    seat.allocationDate = new Date().toISOString().split('T')[0];

    emp.assignedSeatCode = seat.seatCode;
    emp.assignedFloor = seat.floorNumber;
    emp.assignedZone = seat.zone;

    db.activities.unshift({
      id: `ACT-${Date.now()}`,
      text: `Assigned seat ${seat.seatCode} to ${emp.name}`,
      timestamp: "Just now",
      type: "assignment"
    });

    saveToDisk();
    return res.json({ success: true, message: `Seat ${seat.seatCode} assigned to ${emp.name} successfully.`, seat, employee: emp });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Seat assignment failed." });
  }
};

const transferSeat = (req, res) => {
  try {
    const { employeeId, newSeatCode } = req.body;
    return assignSeat(req, res);
  } catch (err) {
    return res.status(500).json({ success: false, message: "Seat transfer failed." });
  }
};

const releaseSeat = (req, res) => {
  try {
    const { seatCode } = req.body;
    const seat = db.seats.find(s => s.seatCode === seatCode || s.id === seatCode);
    if (!seat) return res.status(404).json({ success: false, message: "Seat not found." });

    if (seat.employeeId) {
      const emp = db.employees.find(e => e.employeeId === seat.employeeId);
      if (emp) {
        emp.assignedSeatCode = null;
        emp.assignedFloor = null;
        emp.assignedZone = null;
      }
    }

    seat.status = 'Available';
    seat.employeeId = null;
    seat.employeeName = null;
    seat.projectId = null;
    seat.projectName = null;
    seat.allocationDate = null;

    saveToDisk();
    return res.json({ success: true, message: `Seat ${seatCode} released successfully.`, seat });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to release seat." });
  }
};

// ==========================================
// PROJECTS CONTROLLER
// ==========================================
const getProjects = (req, res) => {
  return res.json({ success: true, projects: db.projects });
};

const createProject = (req, res) => {
  const { name, code, client, manager, description } = req.body;
  if (!name || !code) return res.status(400).json({ success: false, message: "Project Name and Code are required." });

  const newProj = {
    id: `PRJ-${Date.now()}`,
    name,
    code,
    client: client || "Ethara Client",
    manager: manager || "Project Manager",
    description: description || "New strategic initiative project.",
    employeeCount: 0,
    allocatedSeats: 0
  };

  db.projects.push(newProj);
  saveToDisk();
  return res.status(201).json({ success: true, project: newProj, message: "Project created successfully." });
};

// ==========================================
// FLOORS & ZONES CONTROLLER
// ==========================================
const getFloorsAndZones = (req, res) => {
  const floorStats = db.floors.map(f => {
    const floorSeats = db.seats.filter(s => s.floorNumber === f.floorNumber);
    const occupied = floorSeats.filter(s => s.status === 'Occupied').length;
    const available = floorSeats.filter(s => s.status === 'Available').length;
    const reserved = floorSeats.filter(s => s.status === 'Reserved').length;
    const maintenance = floorSeats.filter(s => s.status === 'Maintenance').length;

    return {
      ...f,
      totalSeats: floorSeats.length,
      occupiedSeats: occupied,
      availableSeats: available,
      reservedSeats: reserved,
      maintenanceSeats: maintenance,
      utilizationPercentage: Math.round((occupied / (floorSeats.length || 1)) * 100)
    };
  });

  return res.json({ success: true, floors: floorStats, zones: db.zones });
};

// ==========================================
// DASHBOARD ANALYTICS CONTROLLER
// ==========================================
const getDashboardStats = (req, res) => {
  try {
    const totalEmployees = db.employees.length;
    const totalProjects = db.projects.length;
    const totalSeats = db.seats.length;
    const occupiedSeats = db.seats.filter(s => s.status === 'Occupied').length;
    const vacantSeats = db.seats.filter(s => s.status === 'Available').length;
    const reservedSeats = db.seats.filter(s => s.status === 'Reserved').length;
    const maintenanceSeats = db.seats.filter(s => s.status === 'Maintenance').length;
    const utilizationRate = Math.round((occupiedSeats / (totalSeats || 1)) * 100);

    const employeesWithoutSeats = db.employees.filter(e => !e.assignedSeatCode).length;
    const newJoinersCount = db.employees.filter(e => e.status === 'New Joiner').length;

    // Floor Utilization Breakdown
    const floorUtilization = db.floors.map(f => {
      const seats = db.seats.filter(s => s.floorNumber === f.floorNumber);
      const occ = seats.filter(s => s.status === 'Occupied').length;
      return {
        name: `Floor ${f.floorNumber}`,
        totalSeats: seats.length,
        occupiedSeats: occ,
        utilization: Math.round((occ / (seats.length || 1)) * 100)
      };
    });

    // Project Distribution (Top 8)
    const projectDistribution = db.projects
      .map(p => ({ name: p.code, count: p.employeeCount, allocated: p.allocatedSeats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Department Distribution
    const deptMap = {};
    db.employees.forEach(e => {
      deptMap[e.department] = (deptMap[e.department] || 0) + 1;
    });
    const departmentDistribution = Object.keys(deptMap).map(k => ({ name: k, value: deptMap[k] }));

    return res.json({
      success: true,
      stats: {
        totalEmployees,
        totalProjects,
        totalSeats,
        occupiedSeats,
        vacantSeats,
        reservedSeats,
        maintenanceSeats,
        utilizationRate,
        employeesWithoutSeats,
        newJoinersCount
      },
      charts: {
        floorUtilization,
        projectDistribution,
        departmentDistribution
      },
      announcements: db.announcements,
      activities: db.activities.slice(0, 8)
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to generate dashboard metrics." });
  }
};

// ==========================================
// AI CONTROLLER
// ==========================================
const processAIChat = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: "Prompt is required." });

    const result = await queryAIAssistant(prompt);
    return res.json({ success: true, response: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: "AI process failed." });
  }
};

// ==========================================
// BULK CSV UPLOAD CONTROLLER
// ==========================================
const bulkUploadEmployees = (req, res) => {
  try {
    const { employeesData } = req.body; // JSON array parsed from CSV
    if (!Array.isArray(employeesData) || employeesData.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid or empty CSV payload." });
    }

    let addedCount = 0;
    employeesData.forEach(row => {
      if (row.name && row.email) {
        const newEmpId = `EMP-${1000 + db.employees.length + 1}`;
        const proj = db.projects[0];
        db.employees.push({
          id: newEmpId,
          employeeId: newEmpId,
          name: row.name,
          email: row.email,
          phone: row.phone || "+971 50 1234567",
          department: row.department || "Engineering",
          designation: row.designation || "Software Engineer",
          projectId: proj.id,
          projectName: proj.name,
          manager: proj.manager,
          joiningDate: new Date().toISOString().split('T')[0],
          status: "New Joiner",
          photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row.name)}`,
          assignedSeatCode: null,
          assignedFloor: null,
          assignedZone: null
        });
        addedCount++;
      }
    });

    saveToDisk();
    return res.json({ success: true, message: `Successfully imported ${addedCount} employees from CSV!` });
  } catch (err) {
    return res.status(500).json({ success: false, message: "CSV processing failed." });
  }
};

module.exports = {
  login,
  getCurrentUser,
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getSeats,
  assignSeat,
  transferSeat,
  releaseSeat,
  getProjects,
  createProject,
  getFloorsAndZones,
  getDashboardStats,
  processAIChat,
  bulkUploadEmployees
};
