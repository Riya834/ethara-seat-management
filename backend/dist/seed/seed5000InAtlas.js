"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed5000EmployeesToAtlas = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Employee_1 = require("../models/Employee");
const Project_1 = require("../models/Project");
const FloorZone_1 = require("../models/FloorZone");
const Seat_1 = require("../models/Seat");
dotenv_1.default.config();
const FIRST_NAMES = [
    'Aarav', 'Ananya', 'Rohan', 'Priya', 'Aditya', 'Sneha', 'Vikram', 'Neha',
    'Rahul', 'Kavya', 'Siddharth', 'Pooja', 'Amit', 'Divya', 'Karan', 'Meera',
    'Arjun', 'Isha', 'Rajesh', 'Anjali', 'Deepak', 'Ritu', 'Manish', 'Simran',
    'Sanjay', 'Tanvi', 'Alok', 'Shreya', 'Varun', 'Nisha', 'Gaurav', 'Swati',
    'Alex', 'Sarah', 'John', 'Emily', 'Michael', 'Jessica', 'David', 'Amanda',
    'Daniel', 'Ashley', 'James', 'Stephanie', 'Robert', 'Nicole', 'William', 'Elizabeth'
];
const LAST_NAMES = [
    'Sharma', 'Verma', 'Gupta', 'Patel', 'Kumar', 'Singh', 'Joshi', 'Mehta',
    'Rao', 'Nair', 'Chopra', 'Malhotra', 'Reddy', 'Deshmukh', 'Bhat', 'Kapoor',
    'Agarwal', 'Shah', 'Trivedi', 'Saxena', 'Smith', 'Johnson', 'Williams', 'Jones',
    'Brown', 'Davis', 'Miller', 'Wilson', 'Taylor', 'Anderson', 'Thomas', 'Jackson'
];
const DEPARTMENTS = [
    'Engineering', 'Product', 'Design', 'Sales',
    'Marketing', 'Human Resources', 'Operations', 'Finance'
];
const DESIGNATIONS = [
    'Junior Specialist', 'Specialist', 'Senior Specialist', 'Lead Architect',
    'Staff Engineer', 'Principal Engineer', 'Associate Manager', 'Engineering Manager'
];
const seed5000EmployeesToAtlas = async () => {
    try {
        const count = await Employee_1.Employee.countDocuments();
        if (count >= 500) {
            console.log(`MongoDB Atlas already contains ${count} workforce employee records.`);
            return;
        }
        console.log(`Populating 5,000 workforce employee records into MongoDB Atlas Cloud Database...`);
        // Ensure Projects exist
        let pAtlas = await Project_1.Project.findOne({ code: 'PROJ-ATLAS' });
        if (!pAtlas) {
            pAtlas = await Project_1.Project.create({ name: 'Project Atlas AI Core', code: 'PROJ-ATLAS', description: 'AI Core System', status: 'active' });
        }
        let pBeacon = await Project_1.Project.findOne({ code: 'PROJ-BEACON' });
        if (!pBeacon) {
            pBeacon = await Project_1.Project.create({ name: 'Project Beacon Analytics', code: 'PROJ-BEACON', description: 'Analytics Engine', status: 'active' });
        }
        let pNexus = await Project_1.Project.findOne({ code: 'PROJ-NEXUS' });
        if (!pNexus) {
            pNexus = await Project_1.Project.create({ name: 'Project Nexus Cloud', code: 'PROJ-NEXUS', description: 'Cloud Infrastructure', status: 'active' });
        }
        const projectsList = [pAtlas._id, pBeacon._id, pNexus._id, null];
        // Ensure Floors and Seats exist
        let seats = await Seat_1.Seat.find();
        if (seats.length === 0) {
            const floors = [];
            for (let f = 1; f <= 5; f++) {
                const fl = await FloorZone_1.Floor.create({ floorNumber: f, name: `Floor ${f}`, building: 'Ethara HQ' });
                floors.push(fl);
            }
            const zones = [];
            for (const fl of floors) {
                const zA = await FloorZone_1.Zone.create({ floorId: fl._id, zoneName: 'Zone A', capacity: 250 });
                const zB = await FloorZone_1.Zone.create({ floorId: fl._id, zoneName: 'Zone B', capacity: 250 });
                zones.push(zA, zB);
            }
            const seatsToInsert = [];
            for (const z of zones) {
                for (let i = 1; i <= 250; i++) {
                    seatsToInsert.push({
                        seatNumber: `F${z.floorId}-${z.zoneName.includes('A') ? 'ZA' : 'ZB'}-${String(i).padStart(3, '0')}`,
                        floorId: z.floorId,
                        zoneId: z._id,
                        status: 'available',
                        occupiedBy: null
                    });
                }
            }
            seats = await Seat_1.Seat.insertMany(seatsToInsert);
        }
        // Insert 5,000 workforce records in batches of 1,000
        const totalToInsert = 5000 - count;
        const batchSize = 1000;
        const existingEmails = new Set(await Employee_1.Employee.distinct('email'));
        for (let b = 0; b < Math.ceil(totalToInsert / batchSize); b++) {
            const employeesBatch = [];
            const currentBatchSize = Math.min(batchSize, totalToInsert - b * batchSize);
            for (let i = 0; i < currentBatchSize; i++) {
                const index = count + b * batchSize + i + 1;
                const fname = FIRST_NAMES[index % FIRST_NAMES.length];
                const lname = LAST_NAMES[(index * 7) % LAST_NAMES.length];
                const fullName = `${fname} ${lname}`;
                const email = `emp.${fname.toLowerCase()}.${lname.toLowerCase()}.${index}@ethara.com`;
                if (existingEmails.has(email))
                    continue;
                existingEmails.add(email);
                const dept = DEPARTMENTS[index % DEPARTMENTS.length];
                const desig = DESIGNATIONS[index % DESIGNATIONS.length];
                const proj = projectsList[index % projectsList.length];
                const assignedSeat = seats.length > index ? seats[index]._id : null;
                employeesBatch.push({
                    employeeId: `ETH-${String(index).padStart(5, '0')}`,
                    name: fullName,
                    email,
                    phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
                    designation: desig,
                    department: dept,
                    team: `${dept} Operations Team`,
                    projectId: proj,
                    seatId: assignedSeat,
                    joiningDate: new Date(Date.now() - (index % 365) * 86400000),
                    status: 'active',
                    seatAllocationStatus: assignedSeat ? 'allocated' : 'pending'
                });
            }
            if (employeesBatch.length > 0) {
                await Employee_1.Employee.insertMany(employeesBatch, { ordered: false }).catch(() => { });
                console.log(`Inserted batch ${b + 1}: ${employeesBatch.length} employees...`);
            }
        }
        const finalCount = await Employee_1.Employee.countDocuments();
        console.log(`✅ Success! MongoDB Atlas Cloud Database now contains ${finalCount} active workforce employee records!`);
    }
    catch (error) {
        console.error('Error seeding 5,000 workforce records to MongoDB Atlas:', error);
    }
};
exports.seed5000EmployeesToAtlas = seed5000EmployeesToAtlas;
if (require.main === module) {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://new_seatManagement:Ethara1230@cluster0.ty7ichr.mongodb.net/ethara_seat_db?retryWrites=true&w=majority&appName=Cluster0';
    mongoose_1.default.connect(MONGODB_URI).then(async () => {
        await (0, exports.seed5000EmployeesToAtlas)();
        process.exit(0);
    });
}
