import * as XLSX from "xlsx";
import { calculateMonthsWorked } from "./dateUtils";

/**
 * 🔐 COMPLETE EXPORT SCHEMA (DATA TRUTH)
 * key   = Firestore field
 * label = Excel header
 */
const EXPORT_SCHEMA = [
  { key: "name", label: "Full Name" },
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  { key: "monthsWorked", label: "Months Worked" },

  { key: "birthDate", label: "Birth Date" },
  { key: "age", label: "Age" },
  { key: "gender", label: "Gender" },

  { key: "lgu", label: "LGU" },
  { key: "address", label: "Address" },
  { key: "contactNumber", label: "Contact Number" },
  { key: "email", label: "Email Address" },

  { key: "educationalAttainment", label: "Educational Attainment" },

  { key: "primaryDegree", label: "Primary Degree" },
  { key: "primarySchool", label: "Primary School" },
  { key: "primaryYear", label: "Primary Year" },

  { key: "secondaryDegree", label: "Secondary Degree" },
  { key: "secondarySchool", label: "Secondary School" },
  { key: "secondaryYear", label: "Secondary Year" },

  { key: "collegeDegree", label: "College Degree" },
  { key: "collegeSchool", label: "College School" },
  { key: "collegeYear", label: "College Year" },

  { key: "workCompany", label: "Previous Company" },
  { key: "workPosition", label: "Previous Position" },
  { key: "workPeriod", label: "Work Period" },

  { key: "disadvantageGroup", label: "Disadvantaged Group" },
  { key: "documentsSubmitted", label: "Documents Submitted" },

  { key: "validId", label: "Valid ID Type" },
  { key: "validIdIssued", label: "Valid ID Issued At" },

  { key: "assignmentPlace", label: "Place of Assignment" },
  { key: "adlNo", label: "ADL No." },
  { key: "lbpAccount", label: "LBP Account No." },

  { key: "emergencyName", label: "Emergency Contact Name" },
  { key: "emergencyContact", label: "Emergency Contact Number" },
  { key: "emergencyAddress", label: "Emergency Contact Address" },

  { key: "gsisName", label: "GSIS Beneficiary Name" },
  { key: "gsisRelationship", label: "GSIS Relationship" },

  { key: "gpaiLink", label: "GPAI Link" },
  { key: "employmentStatus", label: "Employment Status" },
  { key: "remarks", label: "Remarks" },
];

/**
 * ✅ FINAL EXPORT FUNCTION
 */
export const exportTableToExcel = (
  table,
  fileName = "GIP Employees.xlsx"
) => {
  const rows =
    table.getSelectedRowModel().rows.length > 0
      ? table.getSelectedRowModel().rows
      : table.getRowModel().rows;

  if (!rows.length) {
    alert("⚠️ No rows to export.");
    return;
  }

  // 1️⃣ MRT-visible columns (UI truth)
  const visibleCols = table
    .getVisibleLeafColumns()
    .filter(
      (col) =>
        col.columnDef.accessorKey &&
        !col.id.startsWith("mrt-") &&
        col.id !== "actions"
    )
    .map((col) => ({
      key: col.columnDef.accessorKey,
      label:
        typeof col.columnDef.header === "string"
          ? col.columnDef.header
          : col.columnDef.accessorKey,
    }));

  // 2️⃣ Merge UI columns + full schema (NO duplicates)
  const mergedColumns = [
    ...visibleCols,
    ...EXPORT_SCHEMA.filter(
      (f) => !visibleCols.some((c) => c.key === f.key)
    ),
  ];

  

  // 3️⃣ Build Excel rows
  const sheetData = rows.map(({ original }) => {
    const row = {};

    mergedColumns.forEach(({ key, label }) => {
      let value = original?.[key] ?? "";

      if (typeof value === "string") value = value.trim();

      if (["name", "lgu"].includes(key)) {
        value = value.toUpperCase();
      }

      if (["startDate", "endDate", "birthDate"].includes(key)) {
        const d = new Date(value);
        value = isNaN(d.getTime())
          ? ""
          : d.toISOString().split("T")[0];
      }

      if (key === "monthsWorked") {
        value =
          Number(value) ||
          calculateMonthsWorked(
            original.startDate,
            original.endDate
          );
      }

      row[label] = value;
    });

    return row;
  });

  

  // 4️⃣ Export
  const worksheet = XLSX.utils.json_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
  XLSX.writeFile(workbook, fileName);

  
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
