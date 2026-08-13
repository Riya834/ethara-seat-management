"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoSeedIfEmpty = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const Employee_1 = require("../models/Employee");
const Project_1 = require("../models/Project");
const FloorZone_1 = require("../models/FloorZone");
const Seat_1 = require("../models/Seat");
const autoSeedIfEmpty = async () => {
    try {
        const userCount = await User_1.User.countDocuments();
        if (userCount > 0) {
            console.log(`Database initialized with ${userCount} users. Auto-seed skipped.`);
            return;
        }
        console.log('Database empty! Auto-seeding default accounts and workforce data...');
        // 1. Create Floors
        const floors = [];
        for (let f = 1; f <= 5; f++) {
            const fl = await FloorZone_1.Floor.create({
                floorNumber: f,
                name: `Floor ${f} - Facility Wing`,
                building: 'Ethara HQ'
            });
            floors.push(fl);
        }
        // 2. Create Zones
        const zonesList = [];
        for (const fl of floors) {
            const zA = await FloorZone_1.Zone.create({ floorId: fl._id, zoneName: 'Zone A - East', capacity: 100 });
            const zB = await FloorZone_1.Zone.create({ floorId: fl._id, zoneName: 'Zone B - West', capacity: 100 });
            zonesList.push(zA, zB);
        }
        // 3. Create Projects
        const projectAtlas = await Project_1.Project.create({ name: 'Project Atlas AI Core', code: 'PROJ-ATLAS', description: 'AI Core Platform', status: 'active' });
        const projectBeacon = await Project_1.Project.create({ name: 'Project Beacon Analytics', code: 'PROJ-BEACON', description: 'Analytics Engine', status: 'active' });
        // 4. Create Seats
        const seatsToInsert = [];
        for (const z of zonesList) {
            for (let i = 1; i <= 50; i++) {
                seatsToInsert.push({
                    seatNumber: `F${z.floorId}-${z.zoneName.includes('East') ? 'ZE' : 'ZW'}-${String(i).padStart(3, '0')}`,
                    floorId: z.floorId,
                    zoneId: z._id,
                    status: 'available',
                    occupiedBy: null
                });
            }
        }
        await Seat_1.Seat.insertMany(seatsToInsert);
        // 5. Create Default Accounts
        const salt = await bcryptjs_1.default.genSalt(10);
        const defaultPasswordHash = await bcryptjs_1.default.hash('Password123!', salt);
        const adminEmp = await Employee_1.Employee.create({
            employeeId: 'ETH-00001',
            name: 'System Admin',
            email: 'admin@ethara.com',
            designation: 'VP Operations',
            department: 'Operations',
            team: 'Operations Team',
            joiningDate: new Date(),
            status: 'active'
        });
        await User_1.User.create({ name: 'System Admin', email: 'admin@ethara.com', passwordHash: defaultPasswordHash, role: 'admin', employeeId: adminEmp._id });
        const hrEmp = await Employee_1.Employee.create({
            employeeId: 'ETH-00002',
            name: 'Sarah HR Lead',
            email: 'hr@ethara.com',
            designation: 'Head of HR',
            department: 'Human Resources',
            team: 'Talent Management',
            joiningDate: new Date(),
            status: 'active'
        });
        await User_1.User.create({ name: 'Sarah HR Lead', email: 'hr@ethara.com', passwordHash: defaultPasswordHash, role: 'hr', employeeId: hrEmp._id });
        const pmEmp = await Employee_1.Employee.create({
            employeeId: 'ETH-00003',
            name: 'Alex PM',
            email: 'pm.atlas@ethara.com',
            designation: 'Senior PM',
            department: 'Engineering',
            team: 'AI Core Team',
            projectId: projectAtlas._id,
            joiningDate: new Date(),
            status: 'active'
        });
        await User_1.User.create({ name: 'Alex PM', email: 'pm.atlas@ethara.com', passwordHash: defaultPasswordHash, role: 'pm', employeeId: pmEmp._id });
        const johnEmp = await Employee_1.Employee.create({
            employeeId: 'ETH-00004',
            name: 'John Doe',
            email: 'emp.john@ethara.com',
            designation: 'Senior Engineer',
            department: 'Engineering',
            team: 'AI Core Team',
            joiningDate: new Date(),
            status: 'active'
        });
        await User_1.User.create({ name: 'John Doe', email: 'emp.john@ethara.com', passwordHash: defaultPasswordHash, role: 'employee', employeeId: johnEmp._id });
        const empPooja = await Employee_1.Employee.create({
            employeeId: 'ETH-99999',
            name: 'Pooja Sharma',
            email: 'pooja@ethara.com',
            designation: 'Senior Engineer',
            department: 'Engineering',
            team: 'AI Core Team',
            joiningDate: new Date(),
            status: 'active'
        });
        await User_1.User.create({ name: 'Pooja Sharma', email: 'pooja@ethara.com', passwordHash: defaultPasswordHash, role: 'employee', employeeId: empPooja._id });
        console.log('✅ Auto-seeding completed successfully! Default logins ready with password "Password123!".');
    }
    catch (err) {
        console.warn('Auto-seeding notice:', err);
    }
};
exports.autoSeedIfEmpty = autoSeedIfEmpty;
