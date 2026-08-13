"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../models/User");
const Employee_1 = require("../models/Employee");
const Project_1 = require("../models/Project");
const FloorZone_1 = require("../models/FloorZone");
const Seat_1 = require("../models/Seat");
const SeatRequest_1 = require("../models/SeatRequest");
const AuditLog_1 = require("../models/AuditLog");
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ethara_seat_db';
const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB for 5,000 Employee Seeding...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected!');
        await User_1.User.deleteMany({});
        await Employee_1.Employee.deleteMany({});
        await Project_1.Project.deleteMany({});
        await FloorZone_1.Floor.deleteMany({});
        await FloorZone_1.Zone.deleteMany({});
        await Seat_1.Seat.deleteMany({});
        await SeatRequest_1.SeatRequest.deleteMany({});
        await AuditLog_1.AuditLog.deleteMany({});
        console.log('Cleared previous database state.');
        // 1. Create 10 Floors
        const floors = [];
        for (let f = 1; f <= 10; f++) {
            const fl = await FloorZone_1.Floor.create({
                floorNumber: f,
                name: `Floor ${f} - Facility Wing ${f <= 5 ? 'A' : 'B'}`,
                building: 'Ethara HQ - Tower A'
            });
            floors.push(fl);
        }
        // 2. Create 30 Zones (3 per floor)
        const zonesList = [];
        for (const fl of floors) {
            const zA = await FloorZone_1.Zone.create({ floorId: fl._id, zoneName: 'Zone A - East Wing', capacity: 120 });
            const zB = await FloorZone_1.Zone.create({ floorId: fl._id, zoneName: 'Zone B - Central Hub', capacity: 120 });
            const zC = await FloorZone_1.Zone.create({ floorId: fl._id, zoneName: 'Zone C - West Wing', capacity: 120 });
            zonesList.push(zA, zB, zC);
        }
        // 3. Create Projects
        const projectAtlas = await Project_1.Project.create({ name: 'Project Atlas AI Core', code: 'PROJ-ATLAS', description: 'Next-gen enterprise search and AI knowledge engine.', status: 'active', startDate: new Date('2025-10-01') });
        const projectBeacon = await Project_1.Project.create({ name: 'Project Beacon Analytics', code: 'PROJ-BEACON', description: 'Real-time telemetry and executive data dashboard.', status: 'active', startDate: new Date('2025-11-15') });
        const projectNexus = await Project_1.Project.create({ name: 'Project Nexus Cloud', code: 'PROJ-NEXUS', description: 'Multi-cloud infrastructure modernization initiative.', status: 'active', startDate: new Date('2026-01-05') });
        const projectOrion = await Project_1.Project.create({ name: 'Project Orion Security', code: 'PROJ-ORION', description: 'Zero-trust network security and identity portal.', status: 'active', startDate: new Date('2026-02-01') });
        const projectPulse = await Project_1.Project.create({ name: 'Project Pulse CRM', code: 'PROJ-PULSE', description: 'Global client relationship platform.', status: 'active', startDate: new Date('2026-03-01') });
        const projects = [projectAtlas, projectBeacon, projectNexus, projectOrion, projectPulse];
        // 4. Create 3,450 Seats (115 seats per zone x 30 zones)
        const seatsToInsert = [];
        for (const z of zonesList) {
            const zoneCode = z.zoneName.includes('Zone A') ? 'ZA' : z.zoneName.includes('Zone B') ? 'ZB' : 'ZC';
            const flNumber = floors.find((f) => f._id.equals(z.floorId)).floorNumber;
            for (let i = 1; i <= 115; i++) {
                const seatNumStr = `F${flNumber}-${zoneCode}-${String(i).padStart(3, '0')}`;
                let tag = null;
                if (flNumber === 2 && zoneCode === 'ZA')
                    tag = projectAtlas._id;
                if (flNumber === 3 && zoneCode === 'ZB')
                    tag = projectBeacon._id;
                seatsToInsert.push({
                    seatNumber: seatNumStr,
                    floorId: z.floorId,
                    zoneId: z._id,
                    status: i % 40 === 0 ? 'maintenance' : i % 25 === 0 ? 'reserved' : 'available',
                    occupiedBy: null,
                    projectTag: tag
                });
            }
        }
        const insertedSeats = await Seat_1.Seat.insertMany(seatsToInsert);
        console.log(`Created ${insertedSeats.length} seats across 10 floors.`);
        // 5. Default Role Test Accounts
        const salt = await bcryptjs_1.default.genSalt(10);
        const defaultPasswordHash = await bcryptjs_1.default.hash('Password123!', salt);
        const adminEmp = await Employee_1.Employee.create({
            employeeId: 'ETH-00001',
            name: 'System Admin',
            email: 'admin@ethara.com',
            phone: '+971501112233',
            designation: 'VP of Workplace Operations',
            department: 'Operations',
            team: 'Workplace Strategy',
            joiningDate: new Date('2022-01-10'),
            status: 'active',
            seatAllocationStatus: 'allocated'
        });
        const adminUser = await User_1.User.create({ name: 'System Admin', email: 'admin@ethara.com', passwordHash: defaultPasswordHash, role: 'admin', employeeId: adminEmp._id });
        const hrEmp = await Employee_1.Employee.create({
            employeeId: 'ETH-00002',
            name: 'Sarah HR Lead',
            email: 'hr@ethara.com',
            phone: '+971502223344',
            designation: 'Head of People Operations',
            department: 'Human Resources',
            team: 'Talent Management',
            joiningDate: new Date('2023-03-15'),
            status: 'active',
            seatAllocationStatus: 'allocated'
        });
        await User_1.User.create({ name: 'Sarah HR Lead', email: 'hr@ethara.com', passwordHash: defaultPasswordHash, role: 'hr', employeeId: hrEmp._id });
        const pmEmp = await Employee_1.Employee.create({
            employeeId: 'ETH-00003',
            name: 'Alex Project Manager',
            email: 'pm.atlas@ethara.com',
            phone: '+971503334455',
            designation: 'Senior Technical PM',
            department: 'Engineering',
            team: 'AI Core Team',
            projectId: projectAtlas._id,
            joiningDate: new Date('2023-06-01'),
            status: 'active',
            seatAllocationStatus: 'allocated'
        });
        await User_1.User.create({ name: 'Alex Project Manager', email: 'pm.atlas@ethara.com', passwordHash: defaultPasswordHash, role: 'pm', employeeId: pmEmp._id });
        const empJohn = await Employee_1.Employee.create({
            employeeId: 'ETH-00004',
            name: 'John Doe',
            email: 'emp.john@ethara.com',
            phone: '+971504445566',
            designation: 'Senior Frontend Engineer',
            department: 'Engineering',
            team: 'AI Core Team',
            projectId: projectAtlas._id,
            managerId: pmEmp._id,
            joiningDate: new Date('2024-02-15'),
            status: 'active',
            seatAllocationStatus: 'allocated'
        });
        await User_1.User.create({ name: 'John Doe', email: 'emp.john@ethara.com', passwordHash: defaultPasswordHash, role: 'employee', employeeId: empJohn._id });
        // Assign initial seats
        insertedSeats[0].status = 'occupied';
        insertedSeats[0].occupiedBy = adminEmp._id;
        await insertedSeats[0].save();
        adminEmp.seatId = insertedSeats[0]._id;
        await adminEmp.save();
        insertedSeats[1].status = 'occupied';
        insertedSeats[1].occupiedBy = hrEmp._id;
        await insertedSeats[1].save();
        hrEmp.seatId = insertedSeats[1]._id;
        await hrEmp.save();
        // 6. Generate 5,000 Employees in batches for optimal performance
        console.log('Generating 5,000 employee records...');
        const firstNames = ['Priya', 'Aarav', 'Rohan', 'Ananya', 'Vikram', 'Neha', 'Kabir', 'Tanvi', 'Aditya', 'Meera', 'Karan', 'Zoya', 'Rahul', 'Ishaan', 'Dev', 'Sneha', 'Arjun', 'Pooja', 'Marcus', 'Elena', 'Sophia', 'Liam', 'Noah', 'Emma', 'Oliver'];
        const lastNames = ['Sharma', 'Patel', 'Verma', 'Gupta', 'Singh', 'Reddy', 'Joshi', 'Kapoor', 'Mehta', 'Nair', 'Deshmukh', 'Chopra', 'Rao', 'Bhatia', 'Smith', 'Johnson', 'Brown', 'Taylor'];
        const departments = ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Human Resources', 'Finance', 'Legal', 'Operations'];
        const employeeBatch = [];
        let seatIndex = 4;
        for (let i = 5; i <= 5000; i++) {
            const fn = firstNames[i % firstNames.length];
            const ln = lastNames[(i * 7) % lastNames.length];
            const empId = `ETH-${String(i).padStart(5, '0')}`;
            const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@ethara.com`;
            const dept = departments[i % departments.length];
            const proj = projects[i % projects.length];
            let isNewJoiner = i % 15 === 0;
            let allocStatus = isNewJoiner && i % 3 === 0 ? 'pending' : 'allocated';
            let assignedSeatId = null;
            if (allocStatus === 'allocated' && seatIndex < insertedSeats.length) {
                assignedSeatId = insertedSeats[seatIndex]._id;
                seatIndex++;
            }
            else {
                allocStatus = 'pending';
            }
            let joiningDate = new Date();
            if (isNewJoiner) {
                joiningDate.setDate(joiningDate.getDate() - ((i % 10) + 1));
            }
            else {
                joiningDate.setMonth(joiningDate.getMonth() - (i % 36));
            }
            employeeBatch.push({
                employeeId: empId,
                name: `${fn} ${ln}`,
                email,
                phone: `+97150${Math.floor(1000000 + Math.random() * 9000000)}`,
                designation: `${dept} Specialist`,
                department: dept,
                team: `${dept} Team ${(i % 5) + 1}`,
                projectId: proj._id,
                managerId: pmEmp._id,
                joiningDate,
                status: isNewJoiner ? 'new_joiner' : 'active',
                seatId: assignedSeatId,
                seatAllocationStatus: allocStatus
            });
        }
        const insertedEmployees = await Employee_1.Employee.insertMany(employeeBatch);
        console.log(`Successfully seeded ${insertedEmployees.length + 4} employees!`);
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};
seedDatabase();
