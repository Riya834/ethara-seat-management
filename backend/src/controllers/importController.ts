import { Response } from 'express';
import Papa from 'papaparse';
import { AuthRequest } from '../middleware/auth';
import { Employee } from '../models/Employee';
import { Project } from '../models/Project';
import { logAudit } from '../utils/auditLogger';

export interface CSVRow {
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  designation: string;
  department: string;
  team?: string;
  projectCode?: string;
  joiningDate?: string;
  status?: string;
}

export const getCSVTemplate = (req: AuthRequest, res: Response) => {
  const csvHeaders = 'employeeId,name,email,phone,designation,department,team,projectCode,joiningDate,status\n';
  const csvSample1 = 'ETH-00501,Aarav Sharma,aarav.sharma@ethara.com,+971501234567,Senior Software Engineer,Engineering,Backend,PROJ-ATLAS,2026-01-15,active\n';
  const csvSample2 = 'ETH-00502,Diya Patel,diya.patel@ethara.com,+971507654321,Product Designer,Design,UX,PROJ-BEACON,2026-02-01,new_joiner\n';

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=employee_import_template.csv');
  return res.status(200).send(csvHeaders + csvSample1 + csvSample2);
};

export const bulkImportEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const dryRun = req.query.dryRun === 'true' || req.body.dryRun === true;
    let fileContent = '';

    if (req.file) {
      fileContent = req.file.buffer.toString('utf-8');
    } else if (req.body.csvString) {
      fileContent = req.body.csvString;
    } else {
      return res.status(400).json({ message: 'No CSV file or csvString provided.' });
    }

    const parsed = Papa.parse<CSVRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim()
    });

    if (parsed.errors && parsed.errors.length > 0) {
      return res.status(400).json({
        message: 'CSV Parsing Errors Encountered',
        errors: parsed.errors
      });
    }

    const rows = parsed.data;
    const errors: Array<{ rowNumber: number; employeeId?: string; error: string }> = [];
    const validEmployeesToInsert: any[] = [];
    const existingProjects = await Project.find().select('code _id');
    const projectMap = new Map(existingProjects.map((p) => [p.code.toUpperCase(), p._id]));

    const existingEmployeeIds = new Set(
      (await Employee.find().select('employeeId')).map((e) => e.employeeId.toUpperCase())
    );
    const existingEmails = new Set(
      (await Employee.find().select('email')).map((e) => e.email.toLowerCase())
    );

    const processedIdsInBatch = new Set<string>();
    const processedEmailsInBatch = new Set<string>();

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 2; // header is row 1

      if (!row.employeeId || !row.name || !row.email || !row.department || !row.designation) {
        errors.push({
          rowNumber: rowNum,
          employeeId: row.employeeId,
          error: 'Missing required fields (employeeId, name, email, department, designation).'
        });
        continue;
      }

      const empIdUpper = row.employeeId.trim().toUpperCase();
      const emailLower = row.email.trim().toLowerCase();

      if (existingEmployeeIds.has(empIdUpper) || processedIdsInBatch.has(empIdUpper)) {
        errors.push({
          rowNumber: rowNum,
          employeeId: row.employeeId,
          error: `Duplicate Employee ID '${row.employeeId}' already exists.`
        });
        continue;
      }

      if (existingEmails.has(emailLower) || processedEmailsInBatch.has(emailLower)) {
        errors.push({
          rowNumber: rowNum,
          employeeId: row.employeeId,
          error: `Duplicate Email '${row.email}' already exists.`
        });
        continue;
      }

      let projectId = null;
      if (row.projectCode) {
        const pCode = row.projectCode.trim().toUpperCase();
        if (projectMap.has(pCode)) {
          projectId = projectMap.get(pCode);
        } else {
          errors.push({
            rowNumber: rowNum,
            employeeId: row.employeeId,
            error: `Invalid Project Code '${row.projectCode}'. Project does not exist.`
          });
          continue;
        }
      }

      processedIdsInBatch.add(empIdUpper);
      processedEmailsInBatch.add(emailLower);

      validEmployeesToInsert.push({
        employeeId: empIdUpper,
        name: row.name.trim(),
        email: emailLower,
        phone: row.phone ? row.phone.trim() : '',
        designation: row.designation.trim(),
        department: row.department.trim(),
        team: row.team ? row.team.trim() : row.department.trim(),
        projectId,
        joiningDate: row.joiningDate ? new Date(row.joiningDate) : new Date(),
        status: ['active', 'new_joiner', 'exited'].includes(row.status || '') ? row.status : 'active',
        seatAllocationStatus: 'pending'
      });
    }

    if (!dryRun && validEmployeesToInsert.length > 0 && errors.length === 0) {
      await Employee.insertMany(validEmployeesToInsert);

      if (req.user) {
        await logAudit(req.user, 'BULK_IMPORT_EMPLOYEES', 'Employee', '', {
          totalRows: rows.length,
          insertedCount: validEmployeesToInsert.length,
          dryRun: false
        });
      }
    }

    return res.json({
      summary: {
        totalRowsProcessed: rows.length,
        validRowCount: validEmployeesToInsert.length,
        errorCount: errors.length,
        isDryRun: dryRun,
        committed: !dryRun && errors.length === 0
      },
      errors,
      preview: validEmployeesToInsert.slice(0, 10)
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
