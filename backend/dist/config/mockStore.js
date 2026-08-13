"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockStore = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class MockStore {
    users = [];
    employees = [];
    projects = [];
    floors = [];
    zones = [];
    seats = [];
    requests = [];
    auditLogs = [];
    initialized = false;
    async initialize() {
        if (this.initialized)
            return;
        const salt = await bcryptjs_1.default.genSalt(10);
        const passHash = await bcryptjs_1.default.hash('Password123!', salt);
        // Seed test users
        this.users = [
            {
                _id: 'usr_admin_001',
                name: 'System Admin',
                email: 'admin@ethara.com',
                passwordHash: passHash,
                role: 'admin',
                employeeId: 'emp_admin_001',
                createdAt: new Date()
            },
            {
                _id: 'usr_hr_001',
                name: 'Sarah HR Lead',
                email: 'hr@ethara.com',
                passwordHash: passHash,
                role: 'hr',
                employeeId: 'emp_hr_001',
                createdAt: new Date()
            },
            {
                _id: 'usr_pm_001',
                name: 'Alex Project Manager',
                email: 'pm.atlas@ethara.com',
                passwordHash: passHash,
                role: 'pm',
                employeeId: 'emp_pm_001',
                createdAt: new Date()
            },
            {
                _id: 'usr_emp_001',
                name: 'John Doe',
                email: 'emp.john@ethara.com',
                passwordHash: passHash,
                role: 'employee',
                employeeId: 'emp_emp_001',
                createdAt: new Date()
            }
        ];
        // Seed Projects
        this.projects = [
            { _id: 'proj_atlas', name: 'Project Atlas AI Core', code: 'PROJ-ATLAS', description: 'Enterprise search & AI knowledge engine.', status: 'active', startDate: new Date('2025-10-01') },
            { _id: 'proj_beacon', name: 'Project Beacon Analytics', code: 'PROJ-BEACON', description: 'Real-time telemetry and executive data dashboard.', status: 'active', startDate: new Date('2025-11-15') },
            { _id: 'proj_nexus', name: 'Project Nexus Cloud', code: 'PROJ-NEXUS', description: 'Multi-cloud infrastructure modernization initiative.', status: 'active', startDate: new Date('2026-01-05') },
            { _id: 'proj_orion', name: 'Project Orion Security', code: 'PROJ-ORION', description: 'Zero-trust security identity portal.', status: 'active', startDate: new Date('2026-02-01') },
            { _id: 'proj_pulse', name: 'Project Pulse CRM', code: 'PROJ-PULSE', description: 'Global client relationship platform.', status: 'active', startDate: new Date('2026-03-01') }
        ];
        // Seed 10 Floors & 30 Zones & 3,500 Seats across facility
        for (let f = 1; f <= 10; f++) {
            const flObj = {
                _id: `floor_${f}`,
                floorNumber: f,
                name: `Floor ${f} - Facility Wing ${f <= 5 ? 'A' : 'B'}`,
                building: 'Ethara HQ - Tower A'
            };
            this.floors.push(flObj);
            ['Zone A', 'Zone B', 'Zone C'].forEach((zName, zIdx) => {
                const zObj = {
                    _id: `zone_${f}_${zIdx + 1}`,
                    floorId: flObj._id,
                    zoneName: `${zName} (Floor ${f})`,
                    capacity: 120
                };
                this.zones.push(zObj);
                // Seed 115 seats per zone = 3,450 total seats
                for (let s = 1; s <= 115; s++) {
                    const seatNum = `F${f}-${zName.replace(' ', '')}-${String(s).padStart(3, '0')}`;
                    this.seats.push({
                        _id: `seat_${f}_${zIdx + 1}_${s}`,
                        seatNumber: seatNum,
                        floorId: flObj,
                        zoneId: zObj,
                        status: s % 30 === 0 ? 'maintenance' : s % 20 === 0 ? 'reserved' : 'available',
                        occupiedBy: null,
                        projectTag: f === 2 ? 'proj_atlas' : f === 3 ? 'proj_beacon' : null
                    });
                }
            });
        }
        // Key employees
        this.employees = [
            {
                _id: 'emp_admin_001',
                employeeId: 'ETH-00001',
                name: 'System Admin',
                email: 'admin@ethara.com',
                phone: '+971501112233',
                designation: 'VP of Workplace Operations',
                department: 'Operations',
                team: 'Workplace Strategy',
                joiningDate: new Date('2022-01-10'),
                status: 'active',
                seatId: this.seats[0],
                seatAllocationStatus: 'allocated',
                createdAt: new Date()
            },
            {
                _id: 'emp_hr_001',
                employeeId: 'ETH-00002',
                name: 'Sarah HR Lead',
                email: 'hr@ethara.com',
                phone: '+971502223344',
                designation: 'Head of People Operations',
                department: 'Human Resources',
                team: 'Talent Management',
                joiningDate: new Date('2023-03-15'),
                status: 'active',
                seatId: this.seats[1],
                seatAllocationStatus: 'allocated',
                createdAt: new Date()
            },
            {
                _id: 'emp_pm_001',
                employeeId: 'ETH-00003',
                name: 'Alex Project Manager',
                email: 'pm.atlas@ethara.com',
                phone: '+971503334455',
                designation: 'Senior Technical PM',
                department: 'Engineering',
                team: 'AI Core Team',
                projectId: this.projects[0],
                joiningDate: new Date('2023-06-01'),
                status: 'active',
                seatId: this.seats[20],
                seatAllocationStatus: 'allocated',
                createdAt: new Date()
            },
            {
                _id: 'emp_emp_001',
                employeeId: 'ETH-00004',
                name: 'John Doe',
                email: 'emp.john@ethara.com',
                phone: '+971504445566',
                designation: 'Senior Frontend Engineer',
                department: 'Engineering',
                team: 'AI Core Team',
                projectId: this.projects[0],
                joiningDate: new Date('2024-02-15'),
                status: 'active',
                seatId: this.seats[21],
                seatAllocationStatus: 'allocated',
                createdAt: new Date()
            }
        ];
        this.seats[0].status = 'occupied';
        this.seats[0].occupiedBy = this.employees[0];
        this.seats[1].status = 'occupied';
        this.seats[1].occupiedBy = this.employees[1];
        this.seats[20].status = 'occupied';
        this.seats[20].occupiedBy = this.employees[2];
        this.seats[21].status = 'occupied';
        this.seats[21].occupiedBy = this.employees[3];
        // Seed 5,000 Employees for Ethara Enterprise Scale!
        const firstNames = ['Priya', 'Aarav', 'Rohan', 'Ananya', 'Vikram', 'Neha', 'Kabir', 'Tanvi', 'Aditya', 'Meera', 'Karan', 'Zoya', 'Rahul', 'Ishaan', 'Dev', 'Sneha', 'Arjun', 'Pooja', 'Marcus', 'Elena', 'Sophia', 'Liam', 'Noah', 'Emma', 'Oliver', 'Lucas', 'Mia', 'Ethan', 'Charlotte', 'Amelia'];
        const lastNames = ['Sharma', 'Patel', 'Verma', 'Gupta', 'Singh', 'Reddy', 'Joshi', 'Kapoor', 'Mehta', 'Nair', 'Deshmukh', 'Chopra', 'Rao', 'Bhatia', 'Smith', 'Johnson', 'Brown', 'Taylor', 'Davis', 'Wilson', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris'];
        const depts = ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Human Resources', 'Finance', 'Legal', 'Operations'];
        let seatIdx = 22;
        for (let i = 5; i <= 5000; i++) {
            const fn = firstNames[i % firstNames.length];
            const ln = lastNames[(i * 7) % lastNames.length];
            const empId = `ETH-${String(i).padStart(5, '0')}`;
            const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@ethara.com`;
            const dept = depts[i % depts.length];
            const proj = this.projects[i % this.projects.length];
            let isNewJoiner = i % 15 === 0;
            let allocStatus = isNewJoiner && i % 3 === 0 ? 'pending' : 'allocated';
            let assignedSeat = null;
            if (allocStatus === 'allocated' && seatIdx < this.seats.length) {
                assignedSeat = this.seats[seatIdx];
                assignedSeat.status = 'occupied';
                seatIdx++;
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
            const empObj = {
                _id: `emp_${i}`,
                employeeId: empId,
                name: `${fn} ${ln}`,
                email,
                phone: `+97150${Math.floor(1000000 + Math.random() * 9000000)}`,
                designation: `${dept} Lead Specialist`,
                department: dept,
                team: `${dept} Team ${(i % 5) + 1}`,
                projectId: proj,
                joiningDate,
                status: isNewJoiner ? 'new_joiner' : 'active',
                seatId: assignedSeat,
                seatAllocationStatus: allocStatus,
                createdAt: new Date()
            };
            if (assignedSeat) {
                assignedSeat.occupiedBy = empObj;
            }
            this.employees.push(empObj);
        }
        this.initialized = true;
    }
}
exports.mockStore = new MockStore();
exports.mockStore.initialize();
