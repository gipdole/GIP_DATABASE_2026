// utils/excel.js

import * as XLSX from "xlsx";
import { calculateMonthsWorked } from "./dateUtils";

/**
 * Import employees from an Excel file (first sheet only).
 * Returns an array of cleaned employee objects.
 *
 * @param {File} file - Excel file to import
 * @returns {Promise<Array<Object>>}
 */
export const importFromExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
          raw: false,
          blankrows: false,
        });

        const cleaned = rawData.map((row) => {
          const startDate = row.startDate?.toString().trim() || "";
          const endDate = row.endDate?.toString().trim() || "";
          const monthsWorked = row.monthsWorked ?? calculateMonthsWorked(startDate, endDate);

          return {
            idNumber: row.idNumber?.toString().trim() || "",
            name: row.name?.toString().trim().toUpperCase() || "",
            gipId: row.gipId?.toString().trim() || "",
            startDate,
            endDate,
            monthsWorked: Number(monthsWorked) || 0,
            lgu: row.lgu?.toString().trim().toUpperCase() || "N/A",
            birthDate: row.birthDate?.toString().trim() || "",
          };
        });

        resolve(cleaned);
      } catch (error) {
        console.error("❌ Failed to parse Excel file:", error);
        reject("❌ Failed to parse Excel file.");
      }
    };

    reader.onerror = () => reject("❌ Error reading the Excel file.");
    reader.readAsBinaryString(file);
  });
};

/**
 * Export employee data to Excel.
 *
 * @param {Array<Object>} data - Employee data to export
 * @param {Array<Object>} columnDefs - Optional columnDefs with accessorKey
 * @param {string} fileName - Output file name
 */
export const exportToExcel = (data, columnDefs = [], fileName = "Employees.xlsx") => {
  if (!Array.isArray(data) || data.length === 0) {
    alert("⚠️ No data to export.");
    return;
  }

  const fallbackFields = [
    "idNumber",
    "name",
    "gipId",
    "startDate",
    "endDate",
    "monthsWorked",
    "lgu",
    "birthDate",
  ];

  const exportableFields = Array.isArray(columnDefs) && columnDefs.length
    ? columnDefs.map((col) => col.accessorKey).filter(Boolean)
    : fallbackFields;

  const cleanData = data.map((row) => {
    const cleaned = {};
    for (const key of exportableFields) {
      let value = row[key];

      if (typeof value === "string") value = value.trim();

      if (["name", "lgu"].includes(key)) value = value?.toUpperCase();

      if (["startDate", "endDate", "birthDate"].includes(key)) {
        try {
          const date = new Date(value);
          value = isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
        } catch {
          value = "";
        }
      }

      cleaned[key] = value ?? "";
    }
    return cleaned;
  });

  const worksheet = XLSX.utils.json_to_sheet(cleanData, {
    header: exportableFields,
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, fileName);
};
