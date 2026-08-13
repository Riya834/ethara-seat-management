"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDefaultUsers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../models/User");
const Employee_1 = require("../models/Employee");
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ethara_seat_db';
const defaultUsers = [
    {
        employeeId: 'ETH-00001',
        name: 'System Admin',
        email: 'admin@ethara.com',
        role: 'admin',
        designation: 'VP Operations',
        department: 'Operations',
        team: 'Operations Team'
    },
    {
        employeeId: 'ETH-00002',
        name: 'Sarah HR Lead',
        email: 'hr@ethara.com',
        role: 'hr',
        designation: 'Head of People Operations',
        department: 'Human Resources',
        team: 'Talent Management'
    },
    {
        employeeId: 'ETH-00003',
        name: 'Alex PM',
        email: 'pm.atlas@ethara.com',
        role: 'pm',
        designation: 'Senior Technical PM',
        department: 'Engineering',
        team: 'AI Core Team'
    },
    {
        employeeId: 'ETH-00004',
        name: 'John Doe',
        email: 'emp.john@ethara.com',
        role: 'employee',
        designation: 'Senior Frontend Engineer',
        department: 'Engineering',
        team: 'AI Core Team'
    },
    {
        employeeId: `ETH-99999`,
        name: 'Pooja Sharma',
        email: 'pooja@ethara.com',
        role: 'employee',
        designation: 'Senior Software Engineer',
        department: 'Engineering',
        team: 'AI Core Team'
    }
];
const ensureDefaultUsers = async () => {
    try {
        console.log('Ensuring all default demo user accounts exist in MongoDB Atlas...');
        await mongoose_1.default.connect(MONGODB_URI);
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash('Password123!', salt);
        for (const u of defaultUsers) {
            let emp = await Employee_1.Employee.findOne({ email: u.email });
            if (!emp) {
                emp = await Employee_1.Employee.create({
                    employeeId: u.employeeId,
                    name: u.name,
                    email: u.email,
                    designation: u.designation,
                    department: u.department,
                    team: u.team,
                    joiningDate: new Date(),
                    status: 'active',
                    seatAllocationStatus: 'pending'
                });
                console.log(`Created Employee: ${u.email}`);
            }
            let usr = await User_1.User.findOne({ email: u.email });
            if (!usr) {
                await User_1.User.create({
                    name: u.name,
                    email: u.email,
                    passwordHash,
                    role: u.role,
                    employeeId: emp._id
                });
                console.log(`Created User: ${u.email}`);
            }
            else {
                usr.passwordHash = passwordHash;
                await usr.save();
                console.log(`Updated Password for User: ${u.email}`);
            }
        }
        console.log('✅ ALL 5 DEFAULT ACCOUNTS (admin@ethara.com, hr@ethara.com, pm.atlas@ethara.com, emp.john@ethara.com, pooja@ethara.com) UPDATED AND READY WITH PASSWORD "Password123!"');
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (err) {
        console.error('Error ensuring default users:', err);
        process.exit(1);
    }
};
exports.ensureDefaultUsers = ensureDefaultUsers;
(0, exports.ensureDefaultUsers)();
