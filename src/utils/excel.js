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
  { key: "placeOfBirth", label: "Place of Birth" },
  { key: "age", label: "Age" },
  { key: "gender", label: "Gender" },

  { key: "lgu", label: "LGU" },
  { key: "address", label: "Address" },
  { key: "contactNumber", label: "Contact Number" },
  { key: "email", label: "Email Address" },

  { key: "educationalAttainment", label: "Educational Attainment" },

  { key: "primaryDegree", label: "Primary Degree" },
  { key: "primarySchool", label: "Primary School" },
  { key: "primaryYearFrom", label: "Primary Year From" },
  { key: "primaryYearTo", label: "Primary Year To" },

  { key: "secondaryDegree", label: "Junior High Degree" },
  { key: "secondarySchool", label: "Junior High School" },
  { key: "secondaryYearFrom", label: "Junior High Year From" },
  { key: "secondaryYearTo", label: "Junior High Year To" },

  { key: "seniorHighDegree", label: "Senior High Degree" },
  { key: "seniorHighSchool", label: "Senior High School" },
  { key: "seniorHighYearFrom", label: "Sinior High Year From" },
  { key: "seniorHighYearTo", label: "Senior High Year To" },

  { key: "collegeDegree", label: "College Degree" },
  { key: "collegeSchool", label: "College School" },
  { key: "collegeYearFrom", label: "College Year From" },
  { key: "collegeYearTo", label: "College Year To" },

  { key: "workCompany1", label: "Previous Company 1" },
  { key: "workPosition1", label: "Previous Position 1" },
  { key: "workPeriod1", label: "Work Period 1" },

  { key: "workCompany2", label: "Previous Company 2" },
  { key: "workPosition2", label: "Previous Position 2" },
  { key: "workPeriod2", label: "Work Period 2" },

  { key: "workCompany3", label: "Previous Company 3" },
  { key: "workPosition3", label: "Previous Position 3" },
  { key: "workPeriod3", label: "Work Period 3" },

  { key: 'pwd', label: 'PWD' },
  { key: 'iP', label: 'IP' },
  { key: 'victimOfArmedConflict', label: 'Victim of Armed Conflict' },
  { key: 'rebelReturnee', label: 'Rebel Returnee' },
  { key: 'fourP', label: '4Ps Beneficiary' },
  { key: 'othersDG', label: 'Others' },

  { key: 'birthCertificate', label: 'Birth Certificate' },
  { key: 'transcriptOfRecords', label: 'Transcript of Records' },
  { key: 'diploma', label: 'Diploma' },
  { key: 'form137138', label: 'Form 137/138' },
  { key: 'applicationLetter', label: 'Application Letter' },
  { key: 'barangayCertificate', label: 'Barangay Certificate' },
  { key: 'certificationFromSchool', label: 'Certification From School' },


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
