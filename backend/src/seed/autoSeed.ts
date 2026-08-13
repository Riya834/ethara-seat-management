import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Employee } from '../models/Employee';
import { Project } from '../models/Project';
import { Floor, Zone } from '../models/FloorZone';
import { Seat } from '../models/Seat';

export const autoSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`Database initialized with ${userCount} users. Auto-seed skipped.`);
      return;
    }

    console.log('Database empty! Auto-seeding default accounts and workforce data...');

    // 1. Create Floors
    const floors: any[] = [];
    for (let f = 1; f <= 5; f++) {
      const fl = await Floor.create({
        floorNumber: f,
        name: `Floor ${f} - Facility Wing`,
        building: 'Ethara HQ'
      });
      floors.push(fl);
    }

    // 2. Create Zones
    const zonesList: any[] = [];
    for (const fl of floors) {
      const zA = await Zone.create({ floorId: fl._id, zoneName: 'Zone A - East', capacity: 100 });
      const zB = await Zone.create({ floorId: fl._id, zoneName: 'Zone B - West', capacity: 100 });
      zonesList.push(zA, zB);
    }

    // 3. Create Projects
    const projectAtlas = await Project.create({ name: 'Project Atlas AI Core', code: 'PROJ-ATLAS', description: 'AI Core Platform', status: 'active' });
    const projectBeacon = await Project.create({ name: 'Project Beacon Analytics', code: 'PROJ-BEACON', description: 'Analytics Engine', status: 'active' });

    // 4. Create Seats
    const seatsToInsert: any[] = [];
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
    await Seat.insertMany(seatsToInsert);

    // 5. Create Default Accounts
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Password123!', salt);

    const adminEmp = await Employee.create({
      employeeId: 'ETH-00001',
      name: 'System Admin',
      email: 'admin@ethara.com',
      designation: 'VP Operations',
      department: 'Operations',
      status: 'active'
    });
    await User.create({ name: 'System Admin', email: 'admin@ethara.com', passwordHash: defaultPasswordHash, role: 'admin', employeeId: adminEmp._id });

    const hrEmp = await Employee.create({
      employeeId: 'ETH-00002',
      name: 'Sarah HR Lead',
      email: 'hr@ethara.com',
      designation: 'Head of HR',
      department: 'Human Resources',
      status: 'active'
    });
    await User.create({ name: 'Sarah HR Lead', email: 'hr@ethara.com', passwordHash: defaultPasswordHash, role: 'hr', employeeId: hrEmp._id });

    const pmEmp = await Employee.create({
      employeeId: 'ETH-00003',
      name: 'Alex PM',
      email: 'pm.atlas@ethara.com',
      designation: 'Senior PM',
      department: 'Engineering',
      projectId: projectAtlas._id,
      status: 'active'
    });
    await User.create({ name: 'Alex PM', email: 'pm.atlas@ethara.com', passwordHash: defaultPasswordHash, role: 'pm', employeeId: pmEmp._id });

    const empPooja = await Employee.create({
      employeeId: 'ETH-00004',
      name: 'Pooja Sharma',
      email: 'pooja@ethara.com',
      designation: 'Senior Engineer',
      department: 'Engineering',
      status: 'active'
    });
    await User.create({ name: 'Pooja Sharma', email: 'pooja@ethara.com', passwordHash: defaultPasswordHash, role: 'employee', employeeId: empPooja._id });

    console.log('✅ Auto-seeding completed successfully! Default logins ready with password "Password123!".');
  } catch (err) {
    console.warn('Auto-seeding notice:', err);
  }
};
