import { Visibility, Edit, Delete } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import { Box } from "@mui/material";
import FillAndDownloadContract from "../components/FillAndDownloadContract";

export const getAllColumns = ({
  onView = () => {},
  onEdit = () => {},
  onDelete = () => {},
} = {}) => {

  const LGU_ORDER = [
    "BAGUIO CITY",
    "ATOK",
    "BAKUN",
    "BENGUET",
    "BOKOD",
    "BUGUIAS",
    "ITOGON",
    "KABAYAN",
    "KAPANGAN",
    "KIBUNGAN",
    "MANKAYAN",
    "LA TRINIDAD",
    "SABLAN",
    "TUBA",
    "TUBLAY",
  ];


    const getLguOrderIndex = (lgu = "") => {
      const upper = lgu.toUpperCase();
      const index = LGU_ORDER.indexOf(upper);
      return index === -1 ? LGU_ORDER.length : index;
    };

    const compareStrings = (a = "", b = "") =>
      a.toLowerCase().localeCompare(b.toLowerCase());


  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr)
          .toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })
          .toUpperCase()
      : "N/A";

  const headerSx = { fontSize: "0.75rem", px: 1, py: 0.5 };

  return [
   // ========================
    // ACTIONS COLUMN
    // ========================
    {
      id: "actions",
      header: "Actions",
      size: 100,
      enableColumnPinning: true,
      enableSorting: false,
      enableResizing: false,
      enableColumnFilter: false,
      
      muiTableBodyCellProps: { sx: { pl: 0, pr: 0, py: 0 } },
      muiTableHeadCellProps: { sx: { fontSize: "0.75rem" } },
      Cell: ({ row }) => {
        const employee = row.original;
        return (
          <Box sx={{ display: "flex" }}>
            <IconButton onClick={() => onView(employee)} size="small" color="success">
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton onClick={() => onEdit(employee)} size="small" color="secondary">
              <Edit fontSize="small" />
            </IconButton>
            <IconButton onClick={() => onDelete(employee.id)} size="small" color="warning">
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        );
      },
    },

    // ========================
    // ROW NUMBER
    // ========================
    {
      id: "rowNumber",
      header: "ID",
      size: 50,
      enableColumnPinning: true,
      enableSorting: true,
      enableColumnFilter: false,
      muiTableHeadCellProps: { sx: headerSx },
      Cell: ({ table, row }) => {
        const rowIndex = table
          .getSortedRowModel()
          .rows.findIndex((r) => r.id === row.id);
        return rowIndex + 1;
      },
    },

    {
      accessorKey: 'gipId',
      header: 'GIP ID',
      size: 150,
      enableColumnPinning: true,
      muiTableHeadCellProps: { sx: headerSx },
      Cell: ({ row }) => row.original.gipId?.toUpperCase() || 'N/A',
    },

    {
      accessorKey: 'name',
      header: 'Full Name',
      size: 200,
      enableColumnPinning: true,
      muiTableHeadCellProps: { sx: headerSx },
      sortingFn: (rowA, rowB) => compareStrings(rowA.original.name, rowB.original.name),
      Cell: ({ row }) => row.original.name?.toUpperCase() || 'N/A',
    },

    { accessorKey: 'address', header: 'Address', size: 290, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ row }) => row.original.address || 'N/A' },

    {
      accessorKey: 'birthDate',
      header: 'Birth Date',
      size: 105,
      enableColumnFilter: false,
      muiTableHeadCellProps: { sx: headerSx },
      Cell: ({ row }) => formatDate(row.original.birthDate),
    },

    {
      accessorKey: 'age',
      header: 'Age',
      size: 70,
      enableColumnFilter: false,
      muiTableHeadCellProps: { sx: headerSx },
      Cell: ({ row }) => {
        const birth = new Date(row.original.birthDate);
        if (isNaN(birth)) return 'N/A';
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return `${age}`;
      },
    },

    { accessorKey: 'gender', header: 'Gender', size: 80, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ row }) => row.original.gender || 'N/A' },

    { accessorKey: 'civilStatus', header: 'Civil Status', size: 80, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ row }) => row.original.civilStatus || 'N/A' },

    { accessorKey: 'placeOfBirth', header: 'Place of Birth', size: 80, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ row }) => row.original.placeOfBirth || 'N/A' },

    { accessorKey: 'contactNumber', header: 'Contact Number', size: 130, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ row }) => row.original.contactNumber || 'N/A' },

    { accessorKey: 'email', header: 'Email Address', size: 180, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ row }) => row.original.email || 'N/A' },

    { accessorKey: 'educationalAttainment', header: 'Education', size: 160, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ row }) => row.original.educationalAttainment || 'N/A' },

        {
            accessorKey: "primaryDegree",
            header: "Primary Degree",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.primaryDegree || "N/A",
        },
        {
            accessorKey: "primarySchool",
            header: "Primary School",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.primarySchool || "N/A",
        },
        {
            accessorKey: "primaryYearTo",
            header: "Primary To",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.primaryYearTo || "N/A",
        },
        {
            accessorKey: "primaryYearFrom",
            header: "Primary From",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.primaryYearFrom || "N/A",
        },

        {
            accessorKey: "secondaryDegree",
            header: "Secondary Degree",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.secondaryDegree || "N/A",
        },
        {
            accessorKey: "secondarySchool",
            header: "Secondary School",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.secondarySchool || "N/A",
        },
        {
            accessorKey: "secondaryYearTo",
            header: "Secondary To",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.secondaryYearTo || "N/A",
        },
        {
            accessorKey: "secondaryYearFrom",
            header: "Secondary From",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.secondaryYearFrom || "N/A",
        },

        {
            accessorKey: "seniorHighDegree",
            header: "Senior High Degree",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.seniorHighDegree || "N/A",
        },
        {
            accessorKey: "seniorHighSchool",
            header: "Senior High School",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.seniorHighSchool || "N/A",
        },
        {
            accessorKey: "seniorHighYearTo",
            header: "Senior High To",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.seniorHighYearTo || "N/A",
        },
        {
            accessorKey: "seniorHighYearFrom",
            header: "Senior High From",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.seniorHighYearFrom || "N/A",
        },

        {
            accessorKey: "collegeDegree",
            header: "College Degree",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.collegeDegree || "N/A",
        },
        {
            accessorKey: "collegeSchool",
            header: "College School",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.collegeSchool || "N/A",
        },
        {
            accessorKey: "collegeYearTo",
            header: "College To",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.collegeYearTo || "N/A",
        },
        {
            accessorKey: "collegeYearFrom",
            header: "College From",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.collegeYearFrom || "N/A",
        },

        {
            accessorKey: "workCompany1",
            header: "Work Company 1",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.workCompany1 || "N/A",
        },
        {
            accessorKey: "workPosition1",
            header: "Work Position 1",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.workPosition1 || "N/A",
        },
        {
            accessorKey: "workPeriod1",
            header: "Work Period 1",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.workPeriod1 || "N/A",
        },

        {
            accessorKey: "workCompany2",
            header: "Work Company 2",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.workCompany2 || "N/A",
        },
        {
            accessorKey: "workPosition2",
            header: "Work Position 2",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.workPosition2 || "N/A",
        },
        {
            accessorKey: "workPeriod2",
            header: "Work Period 2",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.workPeriod2 || "N/A",
        },

        {
            accessorKey: "workCompany3",
            header: "Work Company 3",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.workCompany3 || "N/A",
        },
        {
            accessorKey: "workPosition3",
            header: "Work Position 3",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.workPosition3 || "N/A",
        },
        {
            accessorKey: "workPeriod3",
            header: "Work Period 3",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.workPeriod3 || "N/A",
        },

        


    {
      accessorKey: 'pwd',
      header: 'PWD',
      size: 160,
      muiTableHeadCellProps: { sx: headerSx },
      Cell: ({ cell }) => (cell.getValue() ? 'True' : 'N/A'),
    },

    {
      accessorKey: 'iP',
      header: 'IP',
      size: 160,
      muiTableHeadCellProps: { sx: headerSx },
      Cell: ({ cell }) => (cell.getValue() ? 'True' : 'N/A'),
    },

    {
      accessorKey: 'victimOfArmedConflict',
      header: 'Victim of Armed Conflict',
      size: 160,
      muiTableHeadCellProps: { sx: headerSx },
      Cell: ({ cell }) => (cell.getValue() ? 'True' : 'N/A'),
    },

    {
      accessorKey: 'rebelReturnee',
      header: 'Rebel Returnee',
      size: 160,
      muiTableHeadCellProps: { sx: headerSx },
      Cell: ({ cell }) => (cell.getValue() ? 'True' : 'N/A'),
    },

    {
      accessorKey: 'fourP',
      header: '4Ps Beneficiary',
      size: 160,
      muiTableHeadCellProps: { sx: headerSx },
      Cell: ({ cell }) => (cell.getValue() ? 'True' : 'N/A'),
    },

    {
      accessorKey: 'othersDG',
      header: 'Others',
      size: 160,
      muiTableHeadCellProps: { sx: headerSx },
      Cell: ({ cell }) => (cell.getValue() ? 'True' : 'N/A'),
    },


    {
      accessorKey: 'birthCertificate',
      header: 'Birth Certificate',
      size: 160,
      muiTableHeadCellProps: { sx: headerSx },
      Cell: ({ cell }) => (cell.getValue() ? 'True' : 'N/A'),
    },

    { accessorKey: 'transcriptOfRecords', header: 'Transcript of Records', size: 160, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ cell }) => (cell.getValue() ? 'True' : 'N/A'),
    },

    { accessorKey: 'diploma', header: 'Diploma', size: 160, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ cell }) => (cell.getValue() ? 'True' : 'N/A'),
    },

    { accessorKey: 'form137138', header: 'From 137/138', size: 160, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ cell }) => (cell.getValue() ? 'True' : 'N/A'),
    },

    { accessorKey: 'applicationLetter', header: 'Application Letter', size: 160, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ cell }) => (cell.getValue() ? 'True' : 'N/A'),
    },

    { accessorKey: 'barangayCertificate', header: 'Barangay Certificate', size: 160, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ cell }) => (cell.getValue() ? 'True' : 'N/A'),
    },

    { accessorKey: 'certificationFromSchool', header: 'Certification From School', size: 160, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ cell }) => (cell.getValue() ? 'True' : 'N/A'),
    },

    { accessorKey: 'othersD', header: 'Others', size: 160, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ row }) => row.original.othersD || 'N/A' },

    { accessorKey: 'validId', header: 'Valid ID + No.', size: 160, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ row }) => row.original.validId || 'N/A' },

    { accessorKey: 'validIdIssued', header: 'ID Issued At', size: 140, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ row }) => row.original.validIdIssued || 'N/A' },

    {
      accessorKey: 'lgu',
      header: 'LGU',
      size: 100,
      muiTableHeadCellProps: { sx: headerSx },
      sortingFn: (rowA, rowB) => getLguOrderIndex(rowA.original.lgu) - getLguOrderIndex(rowB.original.lgu),
      Cell: ({ row }) => row.original.lgu?.toUpperCase() || 'N/A',
      editVariant: 'select',
      editSelectOptions: ['N/A', ...LGU_ORDER],
      muiEditTextFieldProps: { select: true },
    },

    {
      accessorKey: 'startDate',
      header: 'Start Date',
      size: 110,
      enableColumnFilter: false,
      muiTableHeadCellProps: { sx: headerSx },
      muiTableBodyCellProps: { sx: { pl: 1.5 } },
      Cell: ({ row }) => formatDate(row.original.startDate),
      sortingFn: (rowA, rowB) => {
        const a = rowA.original;
        const b = rowB.original;
        const dateCompare = new Date(b.startDate) - new Date(a.startDate);
        if (dateCompare !== 0) return dateCompare;
        const lguCompare = getLguOrderIndex(a.lgu) - getLguOrderIndex(b.lgu);
        if (lguCompare !== 0) return lguCompare;
        return compareStrings(a.name, b.name);
      },
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      size: 110,
      enableColumnFilter: false,
      muiTableHeadCellProps: { sx: headerSx },
      Cell: ({ row }) => formatDate(row.original.endDate),
    },

    { accessorKey: 'assignmentPlace', header: 'Place of Assignment', size: 140, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ row }) => row.original.assignmentPlace || 'N/A' },

    { accessorKey: 'adlNo', header: 'ADL Number', size: 140, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ row }) => row.original.adlNo || 'N/A' },

    {
      accessorKey: 'monthsWorked',
      header: 'Duration',
      size: 100,
      enableSorting: false,
      enableColumnFilter: false,
      muiTableHeadCellProps: { sx: headerSx },
      Cell: ({ row }) => {
        const months = row.original.monthsWorked;
        return months != null ? `${months} MONTH${months === 1 ? '' : 'S'}` : 'N/A';
      },
    },

    {
      id: 'generateContract',
      header: '',
      size: 40,
      enableColumnPinning: true,
      enableSorting: false,
      enableResizing: false,
      enableColumnFilter: false,
      Cell: ({ row }) => <FillAndDownloadContract employee={row.original} />,
    },

        {
            accessorKey: "lbpAccount",
            header: "LBP Account",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.lbpAccount || "N/A",
        },

        {
            accessorKey: "emergencyName",
            header: "Emergency Name",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.emergencyName || "N/A",
        },

        {
            accessorKey: "emergencyContact",
            header: "Emergency Contact",
            size: 140,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.emergencyContact || "N/A",
        },

        {
            accessorKey: "emergencyAddress",
            header: "Emergency Address",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.emergencyAddress || "N/A",
        },

        {
            accessorKey: "gsisName",
            header: "GSIS Beneficiary",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.gsisName || "N/A",
        },

        {
            accessorKey: "gsisRelationship",
            header: "GSIS Relationship",
            size: 160,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.gsisRelationship || "N/A",
        },



    { accessorKey: 'employmentStatus', header: 'Employment Status', size: 140, muiTableHeadCellProps: { sx: headerSx }, Cell: ({ row }) => row.original.employmentStatus || 'N/A' },

        {
            accessorKey: "employmentStatus",
            header: "Employment Status",
            size: 140,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.employmentStatus || "N/A",
        },

        {
            accessorKey: "remarks",
            header: "Remarks",
            size: 200,
            muiTableHeadCellProps: { sx: headerSx },
            Cell: ({ row }) => row.original.remarks || "N/A",
        },
    ];
};
