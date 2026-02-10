// src/utils/firebaseHelpers.js

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import * as XLSX from 'xlsx';

import { generateNextGipId } from './idUtils';
import { calculateMonthsWorked } from './dateUtils';

/**
 * Fetch all employees from Firestore.
 * Computes:
 *  - idNumber (1-based index)
 *  - monthsWorked
 */
export const getEmployees = async () => {
  const snapshot = await getDocs(collection(db, 'employees'));

  return snapshot.docs.map((docSnap, i) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      idNumber: i + 1,
      ...data,
      monthsWorked: calculateMonthsWorked(data.startDate, data.endDate),
    };
  });
};

/**
 * Add a new employee to Firestore.
 * Auto-generates GIP ID and computes monthsWorked.
 */
export const addEmployee = async (employee) => {
  const payload = {
    ...employee,
    monthsWorked: calculateMonthsWorked(employee.startDate, employee.endDate),
    year: new Date(employee.startDate).getFullYear().toString(),
  };

  if (!employee.gipId || employee.gipId.trim() === '') {
    payload.gipId = await generateNextGipId(employee.name, employee.startDate);
  }

  await addDoc(collection(db, 'employees'), payload);
};

/**
 * Update an existing employee in Firestore.
 * Recalculates monthsWorked and year.
 */
export const updateEmployee = async (id, employee) => {
  const payload = {
    ...employee,
    monthsWorked: calculateMonthsWorked(employee.startDate, employee.endDate),
    year: new Date(employee.startDate).getFullYear().toString(),
  };

  await setDoc(doc(db, 'employees', id), payload);
};

/**
 * Delete employee by Firestore document ID.
 */
export const deleteEmployee = async (id) => {
  await deleteDoc(doc(db, 'employees', id));
};

/**
 * Map Excel column names to database field names
 */
const mapExcelToDatabaseFields = (excelRow) => {
  const fieldMap = {
    'Full Name': 'name',
    'Start Date': 'startDate',
    'End Date': 'endDate',
    'Months Worked': 'monthsWorked',
    'Birth Date': 'birthDate',
    'GIP ID': 'gipId',
    'Valid ID Type': 'validId',
    'Valid ID Issued At': 'validIdIssued',
    'Place of Assignment': 'assignmentPlace',
    'LGU': 'lgu',
    'Place of Birth': 'placeOfBirth',
    'Address': 'address',
    'Contact Number': 'contactNumber',
    'Email Address': 'email',
    'Gender': 'gender',
    'Educational Attainment': 'educationalAttainment',
    'Primary Degree': 'primaryDegree',
    'Primary School': 'primarySchool',
    'Primary Year From': 'primaryYearFrom',
    'Primary Year To': 'primaryYearTo',
    'Junior High Degree': 'secondaryDegree',
    'Junior High School': 'secondarySchool',
    'Junior High Year From': 'secondaryYearFrom',
    'Junior High Year To': 'secondaryYearTo',
    'Senior High Degree': 'seniorHighDegree',
    'Senior High School': 'seniorHighSchool',
    'Senior High Year From': 'seniorHighYearFrom',
    'Senior High Year To': 'seniorHighYearTo',
    'College Degree': 'collegeDegree',
    'College School': 'collegeSchool',
    'College Year From': 'collegeYearFrom',
    'College Year To': 'collegeYearTo',
    'Previous Company': 'workCompany',
    'Previous Position': 'workPosition',
    'Work Period': 'workPeriod',
    'Disadvantaged Group': 'disadvantageGroup',
    'Documents Submitted': 'documentsSubmitted',
    'ADL No.': 'adlNo',
    'LBP Account No.': 'lbpAccount',
    'Emergency Contact Name': 'emergencyName',
    'Emergency Contact Number': 'emergencyContact',
    'Emergency Contact Address': 'emergencyAddress',
    'GSIS Beneficiary Name': 'gsisName',
    'GSIS Relationship': 'gsisRelationship',
    'GPAI Link': 'gpaiLink',
    'Employment Status': 'employmentStatus',
    'Remarks': 'remarks',
  };

  const mapped = {};
  for (const [excelKey, value] of Object.entries(excelRow)) {
    const dbKey = fieldMap[excelKey] || excelKey;
    mapped[dbKey] = value;
  }
  return mapped;
};

/**
 * Import multiple employees from Excel file.
 * Skips duplicates (same name + startDate).
 * Auto-generates missing GIP ID.
 * Recalculates monthsWorked and year.
 */
export const uploadEmployeesFromExcel = async (file, onSuccess) => {
  const rawData = await importFromExcel(file);
  const data = rawData.map(mapExcelToDatabaseFields);
  const snapshot = await getDocs(collection(db, 'employees'));
  const existing = snapshot.docs.map((doc) => doc.data());

  let added = 0;
  let skipped = 0;

  for (const row of data) {
    const isDuplicate = existing.some(
      (e) =>
        e.name?.toLowerCase().trim() === row.name?.toLowerCase().trim() &&
        e.startDate === row.startDate
    );

    // If duplicate, ask user if they want to accept it
    if (isDuplicate) {
      // eslint-disable-next-line no-restricted-globals
      const acceptDuplicate = confirm(
        `Duplicate found\nDo you want to accept this duplicate?`
      );
      
      if (!acceptDuplicate) {
        skipped++;
        continue;
      }
    }

    const gipId =
      row.gipId && row.gipId.trim() !== ''
        ? row.gipId
        : await generateNextGipId(row.name, row.startDate);

    const payload = {
      ...row,
      gipId,
      monthsWorked: calculateMonthsWorked(row.startDate, row.endDate),
      year: new Date(row.startDate).getFullYear().toString(),
    };

    await addDoc(collection(db, 'employees'), payload);
    added++;
  }

  alert(`Upload complete.\n✅ Added: ${added}\n🚫 Skipped: ${skipped}`);
  onSuccess?.();
};

/**
 * Export selected employees to Excel.
 * Removes internal fields: id, idNumber
 */
export const exportSelectedEmployeesToExcel = (selectedRows = []) => {
  if (selectedRows.length === 0) {
    alert('No rows selected to export.');
    return;
  }

  const exportData = selectedRows.map(({ id, idNumber, ...rest }) => rest);

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
  XLSX.writeFile(workbook, 'SelectedEmployees.xlsx');
};

/**
 * Import employees from Excel file.
 * Parses the Excel file and returns an array of employee objects.
 */
export const importFromExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet);
        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};
