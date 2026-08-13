import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Employee } from '../models/Employee';

dotenv.config();

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

export const ensureDefaultUsers = async () => {
  try {
    console.log('Ensuring all default demo user accounts exist in MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    for (const u of defaultUsers) {
      let emp = await Employee.findOne({ email: u.email });
      if (!emp) {
        emp = await Employee.create({
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

      let usr = await User.findOne({ email: u.email });
      if (!usr) {
        await User.create({
          name: u.name,
          email: u.email,
          passwordHash,
          role: u.role,
          employeeId: emp._id
        });
        console.log(`Created User: ${u.email}`);
      } else {
        usr.passwordHash = passwordHash;
        await usr.save();
        console.log(`Updated Password for User: ${u.email}`);
      }
    }

    console.log('✅ ALL 5 DEFAULT ACCOUNTS (admin@ethara.com, hr@ethara.com, pm.atlas@ethara.com, emp.john@ethara.com, pooja@ethara.com) UPDATED AND READY WITH PASSWORD "Password123!"');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error ensuring default users:', err);
    process.exit(1);
  }
};

ensureDefaultUsers();
