const bcrypt = require('bcryptjs');
const { db, saveToDisk, loadFromDisk } = require('../store/dataStore');

const FIRST_NAMES = [
  "Rahul", "Priya", "Amit", "Neha", "Siddharth", "Ananya", "Rohan", "Sneha", "Vikram", "Pooja",
  "Karan", "Riya", "Aditya", "Shreya", "Arjun", "Tanvi", "Varun", "Kavya", "Manish", "Divya",
  "Abhishek", "Isha", "Nikhil", "Meera", "Gaurav", "Simran", "Rajesh", "Swati", "Suresh", "Tarun",
  "Deepak", "Bhavna", "Kunal", "Archana", "Sanjay", "Preeti", "Aman", "Ritu", "Mohit", "Nidhi",
  "Michael", "Sarah", "David", "Emma", "James", "Sophia", "Daniel", "Olivia", "Alex", "Emily"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Kapoor", "Gupta", "Malhotra", "Mehta", "Singh", "Patel", "Joshi", "Rao",
  "Nair", "Reddy", "Chopra", "Bhasin", "Trivedi", "Deshmukh", "Agarwal", "Bansal", "Saxena", "Kulkarni",
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"
];

const DEPARTMENTS = [
  "Engineering", "Product", "UI/UX Design", "Data & AI", "Cloud Infrastructure",
  "Quality Assurance", "Human Resources", "Project Management", "Cybersecurity", "Operations"
];

const DESIGNATIONS = [
  "Software Engineer", "Senior Software Engineer", "Tech Lead", "Principal Engineer",
  "Product Manager", "UI/UX Designer", "Data Scientist", "DevOps Specialist",
  "QA Automation Engineer", "HR Business Partner", "Scrum Master", "System Architect"
];

const PROJECT_LIST = [
  { name: "Project Alpha", code: "PRJ-ALP", client: "Ethara Core Systems", manager: "Siddharth Malhotra" },
  { name: "Horizon Cloud", code: "PRJ-HRZ", client: "AeroTech Dubai", manager: "Priya Sharma" },
  { name: "Neo Mobility", code: "PRJ-NMB", client: "Ethara Logistics", manager: "Vikram Mehta" },
  { name: "Smart City Hub", code: "PRJ-SCH", client: "Abu Dhabi Gov", manager: "Ananya Rao" },
  { name: "AI Analytics Suite", code: "PRJ-AIA", client: "Finance Corp", manager: "Rahul Kapoor" },
  { name: "CyberShield Gateway", code: "PRJ-CSG", client: "Defense Systems", manager: "Neha Verma" },
  { name: "FinTech Pulse", code: "PRJ-FTP", client: "Emirates Pay", manager: "Arjun Singh" },
  { name: "Vision Spatial 3D", code: "PRJ-VS3", client: "Metaverse Labs", manager: "Tanvi Chopra" },
  { name: "DataMesh Enterprise", code: "PRJ-DME", client: "Retail Global", manager: "Gaurav Patel" },
  { name: "Quantum Portal", code: "PRJ-QPT", client: "Tech Ventures", manager: "Karan Bhasin" },
  { name: "Ethara Connect", code: "PRJ-ENC", client: "Internal HR", manager: "Sneha Nair" },
  { name: "OmniChannel Hub", code: "PRJ-OCH", client: "Saudi Telecom", manager: "Michael Smith" },
  { name: "Aegis Security", code: "PRJ-ASC", client: "Global Bank", manager: "Sarah Johnson" },
  { name: "HyperScale DB", code: "PRJ-HSDB", client: "Cloud Engine", manager: "Rohan Kulkarni" },
  { name: "Green Energy Grid", code: "PRJ-GEG", client: "Eco Power", manager: "Divya Trivedi" },
  { name: "Autonomous Fleet", code: "PRJ-AFT", client: "Mobility X", manager: "Alex Brown" },
  { name: "HealthCare One", code: "PRJ-HCO", client: "Care Alliance", manager: "Emily Davis" },
  { name: "Supply Chain AI", code: "PRJ-SCA", client: "Logistics Hub", manager: "Mohit Agarwal" },
  { name: "Edge Compute Engine", code: "PRJ-ECE", client: "Telco Network", manager: "Varun Saxena" },
  { name: "Identity Shield 2.0", code: "PRJ-IDS", client: "Security Trust", manager: "Preeti Bansal" },
  { name: "Smart Workplace", code: "PRJ-SWP", client: "Ethara Admin", manager: "Aditya Deshmukh" },
  { name: "Robotics Core", code: "PRJ-RBC", client: "Automation Inc", manager: "James Miller" },
  { name: "NextGen Pay", code: "PRJ-NGP", client: "FinTech World", manager: "Sophia Martinez" },
  { name: "Customer 360", code: "PRJ-C360", client: "Retail Direct", manager: "Kunal Gupta" },
  { name: "Ethara Spatial AI", code: "PRJ-SAI", client: "Ethara AI Lab", manager: "Isha Reddy" }
];

const FLOORS = [
  { floorNumber: 1, name: "Floor 1 - Reception & Executive", totalZones: 8 },
  { floorNumber: 2, name: "Floor 2 - Engineering Hub North", totalZones: 8 },
  { floorNumber: 3, name: "Floor 3 - Engineering Hub South", totalZones: 8 },
  { floorNumber: 4, name: "Floor 4 - Product & Design Lab", totalZones: 8 },
  { floorNumber: 5, name: "Floor 5 - AI & Innovation Center", totalZones: 8 }
];

const ZONES = ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E", "Zone F", "Zone G", "Zone H"];

const generateSeedData = async () => {
  if (loadFromDisk() && db.employees && db.employees.length >= 4500) {
    console.log('[Seed] Database already loaded with 5000 records. Skipping regeneration.');
    return;
  }

  console.log('[Seed] Generating fresh 5,000 employee seed dataset...');

  // Reset collections
  db.users = [];
  db.employees = [];
  db.projects = [];
  db.seats = [];
  db.floors = [];
  db.zones = [];
  db.announcements = [];
  db.activities = [];

  // 1. Password Hashing for Default Users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const hrPassword = await bcrypt.hash("hr123", 10);
  const pmPassword = await bcrypt.hash("pm123", 10);
  const empPassword = await bcrypt.hash("emp123", 10);

  db.users = [
    { id: "USR-001", name: "System Admin", email: "admin@ethara.com", password: adminPassword, role: "Admin", employeeId: "EMP-1001" },
    { id: "USR-002", name: "HR Manager", email: "hr@ethara.com", password: hrPassword, role: "HR", employeeId: "EMP-1002" },
    { id: "USR-003", name: "Project Manager", email: "pm@ethara.com", password: pmPassword, role: "Project Manager", employeeId: "EMP-1003" },
    { id: "USR-004", name: "Rahul Sharma", email: "employee@ethara.com", password: empPassword, role: "Employee", employeeId: "EMP-1004" }
  ];

  // 2. Floors & Zones
  FLOORS.forEach(f => {
    db.floors.push({ id: `FLR-${f.floorNumber}`, floorNumber: f.floorNumber, name: f.name, capacity: 500 });
  });

  FLOORS.forEach(f => {
    ZONES.forEach((zName, zIdx) => {
      db.zones.push({
        id: `ZONE-F${f.floorNumber}-${zName.replace(' ', '')}`,
        floorId: `FLR-${f.floorNumber}`,
        floorNumber: f.floorNumber,
        name: zName,
        capacity: 65
      });
    });
  });

  // 3. Projects
  PROJECT_LIST.forEach((p, idx) => {
    db.projects.push({
      id: `PRJ-${100 + idx}`,
      name: p.name,
      code: p.code,
      client: p.client,
      manager: p.manager,
      description: `Core enterprise delivery team for ${p.name}.`,
      employeeCount: 0,
      allocatedSeats: 0
    });
  });

  // 4. Seats (2,500 Seats across 5 Floors x 8 Zones = 500 seats per floor, 62-63 seats per zone)
  let seatCounter = 1;
  for (let fNumber = 1; fNumber <= 5; fNumber++) {
    ZONES.forEach((zName, zIdx) => {
      const seatsInZone = 62;
      for (let s = 1; s <= seatsInZone; s++) {
        const zoneLetter = zName.split(' ')[1]; // A, B, C...
        const seatCode = `F${fNumber}-${zoneLetter}${s.toString().padStart(3, '0')}`;
        db.seats.push({
          id: `SEAT-${seatCounter}`,
          seatNumber: s,
          seatCode: seatCode,
          floorNumber: fNumber,
          zone: zName,
          building: "Ethara HQ Tower A",
          status: "Available", // Available, Occupied, Reserved, Maintenance
          employeeId: null,
          employeeName: null,
          projectId: null,
          projectName: null,
          allocationDate: null
        });
        seatCounter++;
      }
    });
  }

  // 5. Generate 5,000 Employees & Allocate ~2,100 Seats
  console.log('[Seed] Creating 5,000 employee records...');
  
  const today = new Date();
  
  for (let i = 1; i <= 5000; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const name = i === 4 ? "Rahul Sharma" : `${fn} ${ln}`;
    const empId = `EMP-${(1000 + i)}`;
    const dept = DEPARTMENTS[i % DEPARTMENTS.length];
    const desig = DESIGNATIONS[(i * 7) % DESIGNATIONS.length];
    const projectObj = db.projects[i % db.projects.length];
    
    // Join date within last 3 years
    const joinDaysAgo = Math.floor(Math.random() * 1000);
    const joinDate = new Date(today.getTime() - joinDaysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const isNewJoiner = joinDaysAgo < 30; // New joiner if joined within 30 days

    const emp = {
      id: empId,
      employeeId: empId,
      name: name,
      email: i === 4 ? "employee@ethara.com" : `${fn.toLowerCase()}.${ln.toLowerCase()}.${i}@ethara.com`,
      phone: `+971 50 ${Math.floor(1000000 + Math.random() * 9000000)}`,
      department: dept,
      designation: desig,
      projectId: projectObj.id,
      projectName: projectObj.name,
      manager: projectObj.manager,
      joiningDate: joinDate,
      status: isNewJoiner ? "New Joiner" : "Active",
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fn}${ln}${i}`,
      assignedSeatCode: null,
      assignedFloor: null,
      assignedZone: null
    };

    // First ~2,100 employees get allocated a seat
    if (i <= 2100 && i - 1 < db.seats.length) {
      const seat = db.seats[i - 1];
      
      // 5% reserved, 3% maintenance, 92% occupied
      if (i % 25 === 0) {
        seat.status = "Reserved";
      } else if (i % 40 === 0) {
        seat.status = "Maintenance";
      } else {
        seat.status = "Occupied";
        seat.employeeId = emp.employeeId;
        seat.employeeName = emp.name;
        seat.projectId = projectObj.id;
        seat.projectName = projectObj.name;
        seat.allocationDate = joinDate;

        emp.assignedSeatCode = seat.seatCode;
        emp.assignedFloor = seat.floorNumber;
        emp.assignedZone = seat.zone;
        
        projectObj.allocatedSeats++;
      }
    }

    projectObj.employeeCount++;
    db.employees.push(emp);
  }

  // 6. Seed Announcements
  db.announcements = [
    {
      id: "ANN-001",
      title: "Floor 3 Zone B Maintenance Completed",
      category: "Facility Notice",
      content: "Zone B ergonomically designed sit-stand desks upgrade is complete and ready for use.",
      date: new Date().toISOString().split('T')[0],
      author: "Admin Team"
    },
    {
      id: "ANN-002",
      title: "New Joiner Desk Allocation Policy",
      category: "HR Policy",
      content: "All HR managers are requested to complete seat assignments 48 hours prior to onboarding.",
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      author: "HR Operations"
    },
    {
      id: "ANN-003",
      title: "Floor 5 AI & Innovation Hub Expansion",
      category: "Spatial Update",
      content: "Floor 5 Zone G and H are now allocated for high-density AI Research teams.",
      date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
      author: "Facility Admin"
    }
  ];

  // 7. Seed Recent Activities
  db.activities = [
    { id: "ACT-001", text: "Rahul Sharma assigned seat F2-ZA004 under Project Alpha", timestamp: "10 mins ago", type: "assignment" },
    { id: "ACT-002", text: "Priya Verma transferred from F1-ZB012 to F4-ZC008", timestamp: "32 mins ago", type: "transfer" },
    { id: "ACT-003", text: "45 New Joiners onboarded for Project Horizon Cloud", timestamp: "1 hour ago", type: "onboarding" },
    { id: "ACT-004", text: "Floor 4 Zone C maintenance window scheduled", timestamp: "3 hours ago", type: "system" }
  ];

  saveToDisk();
  console.log(`[Seed] Successfully seeded 5,000 Employees, ${db.seats.length} Seats, 25 Projects across 5 Floors!`);
};

module.exports = {
  generateSeedData
};
