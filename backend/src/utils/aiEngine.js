const { db } = require('../store/dataStore');

/**
 * Intelligent NLP & Query Resolver for Ethara Spatial AI Assistant
 */
const queryAIAssistant = async (prompt) => {
  const query = prompt.toLowerCase().trim();
  
  // 1. Where is [Employee Name / ID] seated?
  if (query.includes('where is') || query.includes('who is seated') || query.includes('find employee') || query.includes('emp-')) {
    // Extract candidate employee ID or name
    const empIdMatch = query.match(/emp-\d+/i);
    let matchedEmp = null;

    if (empIdMatch) {
      const searchId = empIdMatch[0].toUpperCase();
      matchedEmp = db.employees.find(e => e.employeeId.toUpperCase() === searchId);
    } else {
      // Name search
      const cleanName = query.replace(/where is|seated|seated\?|assigned to|find/gi, '').trim();
      if (cleanName.length >= 2) {
        matchedEmp = db.employees.find(e => e.name.toLowerCase().includes(cleanName));
      }
    }

    if (matchedEmp) {
      if (matchedEmp.assignedSeatCode) {
        return {
          answer: `📍 **${matchedEmp.name}** (${matchedEmp.employeeId}) is currently seated at **${matchedEmp.assignedSeatCode}** on **Floor ${matchedEmp.assignedFloor}**, **${matchedEmp.assignedZone}**.\n\n` +
                  `• **Department**: ${matchedEmp.department}\n` +
                  `• **Project**: ${matchedEmp.projectName}\n` +
                  `• **Manager**: ${matchedEmp.manager}`,
          data: matchedEmp,
          type: "employee_location"
        };
      } else {
        return {
          answer: `⚠️ **${matchedEmp.name}** (${matchedEmp.employeeId}) has **not been allocated a seat** yet.\n\n` +
                  `• **Status**: ${matchedEmp.status}\n` +
                  `• **Department**: ${matchedEmp.department}\n` +
                  `• **Project**: ${matchedEmp.projectName}\n\n` +
                  `*Tip: As an HR or Admin user, you can assign them an available seat from the Employees page.*`,
          data: matchedEmp,
          type: "employee_unassigned"
        };
      }
    } else {
      return {
        answer: `🔍 Could not find an employee matching your search query in Ethara system. Please try providing their full name or Employee ID (e.g., EMP-1004).`,
        data: null,
        type: "not_found"
      };
    }
  }

  // 2. Who occupies seat [Seat Code]?
  if (query.includes('occupies seat') || query.includes('who is in seat') || query.includes('seat f') || query.includes('seat a') || query.includes('seat b')) {
    const seatMatch = query.match(/f\d+-[a-z]\d+|[a-z]\d{3}/i);
    if (seatMatch) {
      const searchCode = seatMatch[0].toUpperCase();
      const seat = db.seats.find(s => s.seatCode.toUpperCase().includes(searchCode));
      if (seat) {
        if (seat.status === "Occupied" && seat.employeeId) {
          const emp = db.employees.find(e => e.employeeId === seat.employeeId);
          return {
            answer: `👤 Seat **${seat.seatCode}** on Floor ${seat.floorNumber} (${seat.zone}) is occupied by **${seat.employeeName || (emp ? emp.name : 'Unknown')}** (${seat.employeeId}).\n\n` +
                    `• **Project**: ${seat.projectName || 'N/A'}\n` +
                    `• **Allocation Date**: ${seat.allocationDate || 'Recent'}`,
            data: seat,
            type: "seat_occupant"
          };
        } else {
          return {
            answer: `🪑 Seat **${seat.seatCode}** on Floor ${seat.floorNumber} (${seat.zone}) is currently **${seat.status}**.`,
            data: seat,
            type: "seat_status"
          };
        }
      }
    }
  }

  // 3. Vacant seats on Floor X / Zone Y
  if (query.includes('vacant') || query.includes('available seat') || query.includes('free seat')) {
    let floorFilter = null;
    const floorMatch = query.match(/floor\s*(\d)/i);
    if (floorMatch) {
      floorFilter = parseInt(floorMatch[1]);
    }

    let zoneFilter = null;
    const zoneMatch = query.match(/zone\s*([a-h])/i);
    if (zoneMatch) {
      zoneFilter = `Zone ${zoneMatch[1].toUpperCase()}`;
    }

    let vacantSeats = db.seats.filter(s => s.status === 'Available');
    if (floorFilter) vacantSeats = vacantSeats.filter(s => s.floorNumber === floorFilter);
    if (zoneFilter) vacantSeats = vacantSeats.filter(s => s.zone.toLowerCase() === zoneFilter.toLowerCase());

    const totalAvailable = vacantSeats.length;
    const sampleCodes = vacantSeats.slice(0, 8).map(s => s.seatCode).join(', ');

    return {
      answer: `🏢 **Vacant Seats Breakdown**:\n\n` +
              `• **Total Available Seats**: **${totalAvailable.toLocaleString()}** seats\n` +
              (floorFilter ? `• **Floor Filter**: Floor ${floorFilter}\n` : '') +
              (zoneFilter ? `• **Zone Filter**: ${zoneFilter}\n` : '') +
              `\n**Sample Available Seat Codes**:\n\`${sampleCodes || 'None'}\` ... and more.\n\n` +
              `*Head over to the Visual Seat Map to view interactive layout.*`,
      data: { count: totalAvailable, samples: sampleCodes },
      type: "vacancy_query"
    };
  }

  // 4. Employees in Project [Name]
  if (query.includes('project') || query.includes('team')) {
    const matchedProject = db.projects.find(p => query.includes(p.name.toLowerCase()) || query.includes(p.code.toLowerCase()));
    
    if (query.includes('maximum') || query.includes('largest') || query.includes('most employees')) {
      const sorted = [...db.projects].sort((a, b) => b.employeeCount - a.employeeCount);
      const top = sorted[0];
      return {
        answer: `🏆 **${top.name}** (${top.code}) is the largest project with **${top.employeeCount}** assigned employees and **${top.allocatedSeats}** allocated seats.\n\n` +
                `• **Client**: ${top.client}\n` +
                `• **Manager**: ${top.manager}`,
        data: top,
        type: "project_top"
      };
    }

    if (matchedProject) {
      const teamEmps = db.employees.filter(e => e.projectId === matchedProject.id);
      const withSeats = teamEmps.filter(e => e.assignedSeatCode).length;
      return {
        answer: `📁 **${matchedProject.name}** (${matchedProject.code}) Details:\n\n` +
                `• **Client**: ${matchedProject.client}\n` +
                `• **Manager**: ${matchedProject.manager}\n` +
                `• **Total Employees**: **${teamEmps.length}**\n` +
                `• **Seated Employees**: **${withSeats}** (${Math.round((withSeats / (teamEmps.length || 1)) * 100)}% utilization)\n` +
                `• **Unallocated Members**: **${teamEmps.length - withSeats}**`,
        data: matchedProject,
        type: "project_details"
      };
    }
  }

  // 5. Employees without seats / New joiners
  if (query.includes('without seat') || query.includes('unallocated') || query.includes('new joiner')) {
    const unallocated = db.employees.filter(e => !e.assignedSeatCode);
    const newJoinerUnallocated = unallocated.filter(e => e.status === 'New Joiner');

    return {
      answer: `📋 **Unallocated Employees & New Joiners Report**:\n\n` +
              `• **Total Employees without Seats**: **${unallocated.length.toLocaleString()}**\n` +
              `• **New Joiners awaiting Allocation**: **${newJoinerUnallocated.length.toLocaleString()}**\n\n` +
              `**Recent Unassigned New Joiners**:\n` +
              newJoinerUnallocated.slice(0, 5).map(e => `• **${e.name}** (${e.employeeId}) - ${e.department} (${e.projectName})`).join('\n'),
      data: { totalUnallocated: unallocated.length, newJoinerCount: newJoinerUnallocated.length },
      type: "unallocated_report"
    };
  }

  // 6. Overall System Summary
  const totalEmployees = db.employees.length;
  const totalSeats = db.seats.length;
  const occupiedSeats = db.seats.filter(s => s.status === 'Occupied').length;
  const availableSeats = db.seats.filter(s => s.status === 'Available').length;
  const utilization = Math.round((occupiedSeats / (totalSeats || 1)) * 100);

  return {
    answer: `🤖 **Ethara Spatial AI Assistant Executive Summary**:\n\n` +
            `• **Total Workforce**: **${totalEmployees.toLocaleString()}** employees\n` +
            `• **Total Office Seats**: **${totalSeats.toLocaleString()}** seats\n` +
            `• **Occupied Seats**: **${occupiedSeats.toLocaleString()}** (${utilization}% Occupancy)\n` +
            `• **Available Vacant Seats**: **${availableSeats.toLocaleString()}** seats\n` +
            `• **Active Projects**: **${db.projects.length}** projects across 5 Floors\n\n` +
            `*Ask me specific questions like: "Where is Rahul seated?", "Show vacant seats on Floor 2", or "Which project has maximum employees?"*`,
    data: { totalEmployees, totalSeats, occupiedSeats, availableSeats, utilization },
    type: "general_summary"
  };
};

module.exports = {
  queryAIAssistant
};
