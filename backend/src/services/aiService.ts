import { Employee } from '../models/Employee';
import { Seat } from '../models/Seat';
import { Floor, Zone } from '../models/FloorZone';
import { Project } from '../models/Project';

export interface AIToolCall {
  toolName: string;
  args: Record<string, any>;
}

export const executeAITool = async (
  toolName: string,
  args: Record<string, any>,
  userRole: string,
  userEmployeeId?: string
): Promise<any> => {
  switch (toolName) {
    case 'findEmployeeSeat': {
      const searchQuery = args.searchQuery || args.query || args.name || args.employeeId;
      if (!searchQuery) return { error: 'Please specify an employee name or ID.' };

      const regex = new RegExp(searchQuery, 'i');
      
      // If user is employee role, they can look up directory info (name, department, seat), but not sensitive HR notes
      const employee = await Employee.findOne({
        $or: [{ name: regex }, { employeeId: regex }, { email: regex }]
      })
        .populate('projectId', 'name code')
        .populate({
          path: 'seatId',
          populate: [
            { path: 'floorId', select: 'floorNumber name building' },
            { path: 'zoneId', select: 'zoneName' }
          ]
        });

      if (!employee) {
        return { message: `No employee found matching query '${searchQuery}'.` };
      }

      const seatInfo = employee.seatId
        ? {
            seatNumber: (employee.seatId as any).seatNumber,
            floorNumber: (employee.seatId as any).floorId?.floorNumber,
            floorName: (employee.seatId as any).floorId?.name,
            building: (employee.seatId as any).floorId?.building,
            zoneName: (employee.seatId as any).zoneId?.zoneName,
            status: (employee.seatId as any).status
          }
        : null;

      return {
        employeeId: employee.employeeId,
        name: employee.name,
        email: userRole === 'employee' ? undefined : employee.email,
        designation: employee.designation,
        department: employee.department,
        team: employee.team,
        projectName: (employee.projectId as any)?.name || 'Unassigned',
        projectCode: (employee.projectId as any)?.code || null,
        seatAllocationStatus: employee.seatAllocationStatus,
        seatedAt: seatInfo || 'No seat allocated (Pending)'
      };
    }

    case 'getAvailableSeats': {
      const { floorNumber, zoneName } = args;
      const filter: any = { status: 'available' };

      if (floorNumber) {
        const floor = await Floor.findOne({ floorNumber: Number(floorNumber) });
        if (floor) {
          filter.floorId = floor._id;
        } else {
          return { message: `Floor ${floorNumber} not found.` };
        }
      }

      if (zoneName) {
        const zone = await Zone.findOne({ zoneName: new RegExp(zoneName, 'i') });
        if (zone) filter.zoneId = zone._id;
      }

      const count = await Seat.countDocuments(filter);
      const sampleSeats = await Seat.find(filter)
        .populate('floorId', 'floorNumber name')
        .populate('zoneId', 'zoneName')
        .limit(10);

      return {
        totalAvailable: count,
        filter: { floorNumber: floorNumber || 'All', zoneName: zoneName || 'All' },
        sampleSeats: sampleSeats.map((s: any) => ({
          seatNumber: s.seatNumber,
          floorNumber: s.floorId?.floorNumber,
          zoneName: s.zoneId?.zoneName
        }))
      };
    }

    case 'getProjectUtilization': {
      const { projectCode, projectName } = args;
      const pQuery = projectCode || projectName;
      if (!pQuery) return { error: 'Project code or name required.' };

      const project = await Project.findOne({
        $or: [{ code: new RegExp(pQuery, 'i') }, { name: new RegExp(pQuery, 'i') }]
      });

      if (!project) return { message: `Project matching '${pQuery}' not found.` };

      const totalHeadcount = await Employee.countDocuments({ projectId: project._id });
      const allocatedHeadcount = await Employee.countDocuments({
        projectId: project._id,
        seatAllocationStatus: 'allocated'
      });
      const totalReservedBlockSeats = await Seat.countDocuments({ projectTag: project._id });
      const occupiedBlockSeats = await Seat.countDocuments({ projectTag: project._id, status: 'occupied' });

      return {
        projectName: project.name,
        projectCode: project.code,
        status: project.status,
        totalHeadcount,
        allocatedHeadcount,
        pendingAllocation: totalHeadcount - allocatedHeadcount,
        reservedBlockSeats: totalReservedBlockSeats,
        occupiedBlockSeats: occupiedBlockSeats,
        utilizationPercentage:
          totalReservedBlockSeats > 0 ? Math.round((occupiedBlockSeats / totalReservedBlockSeats) * 100) : 0
      };
    }

    case 'getNewJoinerStatus': {
      // Role Check: Employee role gets aggregated counts
      if (userRole === 'employee') {
        const totalNewJoiners = await Employee.countDocuments({ status: 'new_joiner' });
        const pendingCount = await Employee.countDocuments({
          status: 'new_joiner',
          seatAllocationStatus: 'pending'
        });
        return {
          totalNewJoiners,
          pendingSeatAllocation: pendingCount,
          allocated: totalNewJoiners - pendingCount
        };
      }

      const pendingJoiners = await Employee.find({
        status: 'new_joiner',
        seatAllocationStatus: 'pending'
      })
        .populate('projectId', 'name code')
        .sort({ joiningDate: -1 })
        .limit(10);

      return {
        totalPendingNewJoiners: pendingJoiners.length,
        pendingList: pendingJoiners.map((j: any) => ({
          employeeId: j.employeeId,
          name: j.name,
          department: j.department,
          projectCode: j.projectId?.code || 'Unassigned',
          joiningDate: j.joiningDate,
          seatAllocationStatus: j.seatAllocationStatus
        }))
      };
    }

    default:
      return { error: `Unknown tool function '${toolName}'` };
  }
};

export const processAIQuery = async (
  prompt: string,
  userRole: string,
  userEmployeeId?: string
): Promise<{ textResponse: string; toolCalled?: string; toolResult?: any }> => {
  const cleanPrompt = prompt.trim().toLowerCase();

  let toolName = '';
  let args: Record<string, any> = {};

  // Intent Parsing & Tool Execution Logic
  if (cleanPrompt.includes('where does') || cleanPrompt.includes('where is') || cleanPrompt.includes('seated') || cleanPrompt.includes('seat of') || cleanPrompt.includes('find employee')) {
    toolName = 'findEmployeeSeat';
    const match = prompt.match(/(?:where is|where does|seat of|find employee|find)\s+([a-zA-Z0-9\s]+?)(?:\s+sit|\s+seated|\?|$)/i);
    args = { searchQuery: match ? match[1].trim() : prompt.replace(/where|does|is|seated|sit|the|seat|find/gi, '').trim() };
  } else if (cleanPrompt.includes('free') || cleanPrompt.includes('available') || cleanPrompt.includes('vacant') || cleanPrompt.includes('open seat')) {
    toolName = 'getAvailableSeats';
    const floorMatch = prompt.match(/floor\s*(\d+)/i);
    const zoneMatch = prompt.match(/zone\s*([a-zA-Z0-9]+)/i);
    args = {
      floorNumber: floorMatch ? floorMatch[1] : undefined,
      zoneName: zoneMatch ? zoneMatch[1] : undefined
    };
  } else if (cleanPrompt.includes('utilization') || cleanPrompt.includes('project') || cleanPrompt.includes('block')) {
    toolName = 'getProjectUtilization';
    const projMatch = prompt.match(/(?:project|for)\s+([a-zA-Z0-9_-]+)/i);
    args = { projectCode: projMatch ? projMatch[1].trim() : 'PROJ-ATLAS' };
  } else if (cleanPrompt.includes('new joiner') || cleanPrompt.includes('allocated') || cleanPrompt.includes('pending joiner') || cleanPrompt.includes('starting monday')) {
    toolName = 'getNewJoinerStatus';
    args = {};
  } else {
    // Default fallback tool lookup
    toolName = 'findEmployeeSeat';
    args = { searchQuery: prompt };
  }

  const toolResult = await executeAITool(toolName, args, userRole, userEmployeeId);

  let textResponse = '';
  if (toolName === 'findEmployeeSeat') {
    if (toolResult.name) {
      if (typeof toolResult.seatedAt === 'object' && toolResult.seatedAt !== null) {
        textResponse = `📌 **${toolResult.name}** (${toolResult.employeeId}) is assigned to **Project ${toolResult.projectCode || toolResult.projectName}** and sits at **Seat ${toolResult.seatedAt.seatNumber}** on **Floor ${toolResult.seatedAt.floorNumber} (${toolResult.seatedAt.zoneName})**.`;
      } else {
        textResponse = `⚠️ **${toolResult.name}** (${toolResult.employeeId}) is currently in **${toolResult.department}** (${toolResult.projectName}) but has **No Seat Allocated (Pending)**.`;
      }
    } else {
      textResponse = toolResult.message || `No employee record found for "${args.searchQuery}".`;
    }
  } else if (toolName === 'getAvailableSeats') {
    textResponse = `🏢 There are currently **${toolResult.totalAvailable} free/available seats** in Ethara facilities${args.floorNumber ? ` on Floor ${args.floorNumber}` : ''}.`;
    if (toolResult.sampleSeats && toolResult.sampleSeats.length > 0) {
      const seatList = toolResult.sampleSeats.map((s: any) => `${s.seatNumber} (Fl ${s.floorNumber}, ${s.zoneName})`).join(', ');
      textResponse += ` Sample available seats: ${seatList}.`;
    }
  } else if (toolName === 'getProjectUtilization') {
    if (toolResult.projectName) {
      textResponse = `📊 **Project ${toolResult.projectName} (${toolResult.projectCode})**:\n- Total Headcount: **${toolResult.totalHeadcount}**\n- Allocated Seats: **${toolResult.allocatedHeadcount}**\n- Reserved Block Seats: **${toolResult.reservedBlockSeats}**\n- Seat Utilization: **${toolResult.utilizationPercentage}%**`;
    } else {
      textResponse = toolResult.message || `Project information unavailable.`;
    }
  } else if (toolName === 'getNewJoinerStatus') {
    if (userRole === 'employee') {
      textResponse = `👥 Ethara currently has **${toolResult.totalNewJoiners} new joiners**, with **${toolResult.pendingSeatAllocation}** awaiting seat allocation.`;
    } else {
      textResponse = `🚨 There are **${toolResult.totalPendingNewJoiners} new joiner(s)** currently pending seat allocation.`;
      if (toolResult.pendingList && toolResult.pendingList.length > 0) {
        const topJoiner = toolResult.pendingList[0];
        textResponse += ` For example, ${topJoiner.name} (${topJoiner.employeeId}, ${topJoiner.department}) joined on ${new Date(topJoiner.joiningDate).toLocaleDateString()} and is still pending a seat assignment.`;
      }
    }
  }

  return { textResponse, toolCalled: toolName, toolResult };
};
