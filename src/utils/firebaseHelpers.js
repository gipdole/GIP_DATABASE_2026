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

import { importFromExcel } from './excel';
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
 * Import multiple employees from Excel file.
 * Skips duplicates (same name + startDate).
 * Auto-generates missing GIP ID.
 * Recalculates monthsWorked and year.
 */
export const uploadEmployeesFromExcel = async (file, onSuccess) => {
  const data = await importFromExcel(file);
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

    if (isDuplicate) {
      skipped++;
      continue;
    }

    const gipId =
      row.gipId?.trim() !== ''
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
