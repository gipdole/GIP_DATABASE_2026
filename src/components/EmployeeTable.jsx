import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";

import {
  getEmployees,
  deleteEmployee,
  uploadEmployeesFromExcel,
} from "../utils/firebaseHelpers";

import { getAllColumns } from "../utils/columns";
import EmployeeFormModal from "./EmployeeFormModal";
import ViewEmployeeModal from "./ViewEmployeeModal";
import { exportTableToExcel } from "../utils/excel";

const lguPriority = [
  "baguio city",
  "atok",
  "bakun",
  "benguet",
  "bokod",
  "buguias",
  "itogon",
  "kabayan",
  "kapangan",
  "kibungan",
  "mankayan",
  "sablan",
  "tuba",
  "tublay",
];

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [formMode, setFormMode] = useState(null);

  // ✅ Fetch Employees (NO manual sorting — MRT handles it)
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const data = await getEmployees();
    setEmployees(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // ✅ Memoized Data (important for performance)
  const memoData = useMemo(() => employees, [employees]);

  // Handlers (memoized to prevent re-renders)
  const handleView = useCallback((row) => setViewRow(row), []);
  const handleEdit = useCallback((row) => {
    setEditRow(row);
    setFormMode("edit");
  }, []);
  const handleAdd = useCallback(() => {
    setEditRow(null);
    setFormMode("add");
  }, []);
  const handleCloseForm = useCallback(() => {
    setEditRow(null);
    setFormMode(null);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      await deleteEmployee(id);
      fetchEmployees();
    },
    [fetchEmployees]
  );

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    await uploadEmployeesFromExcel(file, fetchEmployees);
    setLoading(false);
  };

  // Columns
  const columns = useMemo(
    () =>
      getAllColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleView, handleEdit, handleDelete]
  );

  const table = useMaterialReactTable({
    columns,
    data: memoData,

    // 🔥 PERFORMANCE SETTINGS
    enableRowVirtualization: true,
    layoutMode: "grid-no-grow",

    enablePagination: true,
    muiPaginationProps: {
      rowsPerPageOptions: [25, 50, 100, 200],
      showFirstButton: true,
      showLastButton: true,
    },
    enableSorting: true,
    enableStickyHeader: true,
    enableRowSelection: true,
    enableColumnPinning: true,
    enableColumnResizing: true,


    initialState: {
      pagination: { pageSize: 50, pageIndex: 0 },
      density: "compact",
      columnPinning: {
        left: ["mrt-row-select", "actions", "rowNumber", "name", "gipId"],
        right: ["generateContract"],
      },
      sorting: [
        { id: "dateHired", desc: true },
        { id: "lgu", desc: false },
        { id: "name", desc: false },
      ],
    },

    // 🔥 Custom LGU Sorting (priority-based)
    sortingFns: {
      lguPriority: (rowA, rowB, columnId) => {
        const a = (rowA.getValue(columnId) || "").toLowerCase();
        const b = (rowB.getValue(columnId) || "").toLowerCase();

        const indexA = lguPriority.indexOf(a);
        const indexB = lguPriority.indexOf(b);

        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
      },
    },

    muiTableContainerProps: {
      sx: {
        height: "calc(100vh - 230px)",
      },
    },

    // 🔥 Fixed height cells (better for virtualization)
    muiTableBodyCellProps: {
      sx: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        py: 0.5,
      },
    },

    renderTopToolbarCustomActions: ({ table }) => {
      const selectedRows = table.getSelectedRowModel().rows;
      const hasSelected = selectedRows.length > 0;

      const handleDeleteSelected = async () => {
        if (!window.confirm(`Delete ${selectedRows.length} selected employee(s)?`))
          return;

        await Promise.all(
          selectedRows.map((row) => deleteEmployee(row.original.id))
        );

        table.resetRowSelection();
        fetchEmployees();
      };

      const handleExportSelectedExcel = () => {
        // const selected = selectedRows.map((row) => row.original);
        if (!selectedRows.length) return alert("No rows selected");
        exportTableToExcel(table);
      };

      return (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant="contained" onClick={handleAdd}>
            Add
          </Button>

          <Button size="small" variant="outlined" component="label">
            Import
            <input
              type="file"
              hidden
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
            />
          </Button>

          <Button size="small" variant="outlined" onClick={handleExportSelectedExcel}>
            Export Selected
          </Button>

          {hasSelected && (
            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={handleDeleteSelected}
            >
              Delete Selected
            </Button>
          )}
        </Box>
      );
    },
  });

  return (
    <Box sx={{ p: 1 }}>
      {loading ? (
        <Box textAlign="center" py={4}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <MaterialReactTable table={table} />
      )}

      <ViewEmployeeModal
        open={!!viewRow}
        onClose={() => setViewRow(null)}
        row={viewRow}
        allRows={employees}
      />

      {!!formMode && (
        <EmployeeFormModal
          open
          onClose={handleCloseForm}
          employee={editRow}
          existingEmployees={employees}
          refresh={fetchEmployees}
          mode={formMode}
        />
      )}
    </Box>
  );
};

export default EmployeeTable;
