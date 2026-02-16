import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

import {
  getEmployees,
  deleteEmployee,
  uploadEmployeesFromExcel,
} from '../utils/firebaseHelpers';

import { getAllColumns } from '../utils/columns';
import EmployeeFormModal from './EmployeeFormModal';
import ViewEmployeeModal from './ViewEmployeeModal';

import { exportTableToExcel } from "../utils/excel";

const lguPriority = [
  'baguio city', 'atok', 'bakun', 'benguet', 'bokod', 'buguias',
  'itogon', 'kabayan', 'kapangan', 'kibungan', 'mankayan',
  'sablan', 'tuba', 'tublay'
];

const lguSortFn = (rowA, rowB, columnId) => {
  const a = (rowA.getValue(columnId) || '').toLowerCase();
  const b = (rowB.getValue(columnId) || '').toLowerCase();
  const indexA = lguPriority.indexOf(a);
  const indexB = lguPriority.indexOf(b);
  if (indexA === -1 && indexB === -1) return a.localeCompare(b);
  if (indexA === -1) return 1;
  if (indexB === -1) return -1;
  return indexA - indexB;
};

const dateSortFn = (rowA, rowB, columnId) => {
  const dateA = new Date(rowA.getValue(columnId));
  const dateB = new Date(rowB.getValue(columnId));
  return dateA - dateB;
};

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [formMode, setFormMode] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const data = await getEmployees();
    const sorted = [...data].sort((a, b) => {
      const dateDiff = new Date(a.startDate) - new Date(b.startDate);
      if (dateDiff !== 0) return dateDiff;
      const indexA = lguPriority.indexOf((a.lgu || '').toLowerCase());
      const indexB = lguPriority.indexOf((b.lgu || '').toLowerCase());
      if (indexA !== indexB) return indexA - indexB;
      return (a.name || '').localeCompare(b.name || '');
    });
    setEmployees(sorted);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleView = (row) => setViewRow(row);
  const handleEdit = (row) => { setEditRow(row); setFormMode('edit'); };
  const handleAdd = () => { setEditRow(null); setFormMode('add'); };
  const handleDelete = async (id) => { await deleteEmployee(id); await fetchEmployees(); };
  const handleCloseForm = () => { setEditRow(null); setFormMode(null); };

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadEmployeesFromExcel(file, fetchEmployees);
  };

  const handleExportSelectedExcel = () => {
    exportTableToExcel(table);
  };

  const columns = useMemo(() =>
    getAllColumns({ onView: handleView, onEdit: handleEdit, onDelete: handleDelete }),
    [handleView, handleEdit, handleDelete]
  );

  const table = useMaterialReactTable({
    columns,
    data: employees,
    enablePagination: false,
    enableSorting: true,
    enableStickyHeader: true,
    enableStickyFooter: false,
    enableRowSelection: true,
    enableColumnPinning: true,
    enableColumnResizing: true,
    renderBottomToolbar: false,
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: 1, px: 0.5 }}>
        <Button size="small" variant="contained" sx={{ backgroundColor: "#55C386", color: '#000000' }} onClick={handleAdd}>Add</Button>
        <Button
          size="small"
          variant="outlined"
          component="label"
          sx={{
            borderColor: "#55C386",
            color: "#55C386",
            "&:hover": {
              borderColor: "#2E7D32",
              backgroundColor: "rgba(85,195,134,0.08)",
            },
          }}
        >
          Import
          <input type="file" hidden accept=".xlsx, .xls" onChange={handleImportExcel} />
        </Button>

        <Button
          size="small"
          variant="outlined"
          onClick={handleExportSelectedExcel}
          sx={{
            borderColor: "#55C386",
            color: "#55C386",
            "&:hover": {
              borderColor: "#2E7D32",
              backgroundColor: "rgba(85,195,134,0.08)",
            },
          }}
        >
          Export
        </Button>
      </Box>
    ),
    customSortingFns: { lguSort: lguSortFn, dateAsc: dateSortFn },
    initialState: {
      density: 'compact',
      columnPinning: {
        left: ['mrt-row-select', 'actions', 'rowNumber', 'name', 'gipId'],
        right: ['generateContract'],
      },
      sorting: [
        { id: 'startDate', desc: false },
        { id: 'lgu', desc: false },
        { id: 'name', desc: false },
      ],
    },

    muiTableContainerProps: {
      sx: {
        height: 'calc(105vh - 180px)',
        overflow: 'auto',
        padding: 0,
        margin: 0,
        borderWidth: '1px',
        borderColor: '#ddd',
      },
    },
    muiTablePaperProps: {
      sx: {
        boxShadow: 'none',
        borderRadius: 0,
        border: '1px solid #ccc',
      },
    },
    muiTableBodyCellProps: ({ column }) => ({
      sx: column.id === 'mrt-row-select'
        ? { px: -5, py: 0.1 }
        : { px: -5, py: 0.1 },
    }),
    muiTableHeadCellProps: ({ column }) => ({
      sx: column.id === 'mrt-row-select'
        ? { px: -5, py: 0.1 }
        : { px: -5, py: 0.1, fontSize: '1rem' },
    }),
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

      <ViewEmployeeModal open={!!viewRow} onClose={() => setViewRow(null)} row={viewRow} allRows={employees} />
      {!!formMode && (
        <EmployeeFormModal
          open={true}
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
