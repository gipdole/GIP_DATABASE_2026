// src/components/ViewEmployeeModal.jsx
import { useMemo, useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    // Typography,
    Button,
    // Box,
    // Card,
    // CardContent,
    // CardHeader,
} from "@mui/material";
import { isValid, parseISO, format } from "date-fns";

// import GIPExperience from "./GIPExperience";
import { calculateMonthsAndDaysWorked, formatDuration } from "../utils/dateUtils";
import { fillGIPInfoPDF } from "../utils/fillPdf";
import gipEmployeeForm from "../assets/GIPEmployeeForm.pdf";

function GIPInfoPDFPreview({ data }) {
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        let url;

        fillGIPInfoPDF(gipEmployeeForm, data).then((blob) => {
            url = URL.createObjectURL(blob);
            setPdfUrl(url);
        });

        // Cleanup when component unmounts or data changes
        return () => {
            if (url) {
                URL.revokeObjectURL(url);
                setPdfUrl(null);
            }
        };
    }, [data]);

    if (!pdfUrl) return <div>Loading...</div>;

    return (
        <iframe
            id="pdf-iframe"
            src={pdfUrl}
            width="100%"
            height="600px"
            style={{ border: "none" }}
            title="Filled PDF Preview"
        />
    );
}

const ViewEmployeeModal = ({ open, onClose, row, allRows }) => {
    if (!row) return null;

    console.log(row);

    // Top Duration field
    // const durationTop = useMemo(() => {
    //     return formatDuration(calculateMonthsAndDaysWorked(row.dateHired, row.dateEnded));
    // }, [row.dateHired, row.dateEnded]);

    // // Total GIP experience across all entries
    // const totalExperience = useMemo(() => {
    //     const entries = allRows.filter((r) => r.name?.toLowerCase().trim() === row.name?.toLowerCase().trim());

    //     const total = entries.reduce(
    //         (acc, entry) => {
    //             const { months, days } = calculateMonthsAndDaysWorked(entry.dateHired, entry.dateEnded);
    //             acc.months += months;
    //             acc.days += days;
    //             return acc;
    //         },
    //         { months: 0, days: 0 },
    //     );

    //     return formatDuration(total);
    // }, [allRows, row.name]);

    const formatValue = (value, fallback = "N/A") =>
        value === undefined || value === null || value === "" ? fallback : value;

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        const parsed = parseISO(dateStr);
        return isValid(parsed) ? format(parsed, "MMM dd, yyyy").toUpperCase() : "Invalid";
    };

    // const renderValue = (label, value) => {
    //     if (label === "Full Name" && typeof value === "string") {
    //         return value.toUpperCase();
    //     }

    //     if (label.includes("Date")) {
    //         return formatDate(value);
    //     }

    //     return formatValue(value);
    // };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen
            maxWidth="md"
            aria-labelledby="view-employee-title"
            aria-describedby="view-employee-description"
        >
            <DialogTitle id="view-employee-title" sx={{ backgroundColor: "#55C386" }}>
                EMPLOYEE INFORMATION
            </DialogTitle>

            <DialogContent
                dividers
                id="view-employee-description"
                sx={{ maxHeight: "100%", overflowY: "auto", display: "flex", justifyContent: "space-between", gap: 3 }}
            >
                <GIPInfoPDFPreview
                    data={{
                        fullName: formatValue(row.name),
                        address: formatValue(row.address),
                        contactNumber: formatValue(row.contactNumber),
                        email: formatValue(row.email),
                        birthDate: formatValue(formatDate(row.birthDate)),
                        gender: formatValue(row.gender),
                        civilStatus: formatValue(row.civilStatus),
                        collegeDegree: formatValue(row.collegeDegree),
                        collegeYearFrom: formatValue(row.collegeYearFrom),
                        collegeYearTo: formatValue(row.collegeYearTo),
                        collegeSchool: formatValue(row.collegeSchool),
                        seniorHighDegree: formatValue(row.seniorHighDegree),
                        seniorHighYearFrom: formatValue(row.seniorHighYearFrom),
                        seniorHighYearTo: formatValue(row.seniorHighYearTo),
                        seniorHighSchool: formatValue(row.seniorHighSchool),
                        secondaryDegree: formatValue(row.secondaryDegree),
                        secondaryYearFrom: formatValue(row.secondaryYearFrom),
                        secondaryYearTo: formatValue(row.secondaryYearTo),
                        secondarySchool: formatValue(row.secondarySchool),
                        primarySchool: formatValue(row.primarySchool),
                        primaryYearFrom: formatValue(row.primaryYearFrom),
                        primaryYearTo: formatValue(row.primaryYearTo),
                        primaryDegree: formatValue(row.primaryDegree),
                        workCompany1: formatValue(row.workCompany1),
                        workPeriod1: formatValue(row.workPeriod1),
                        workPosition1: formatValue(row.workPosition1),
                        workCompany2: formatValue(row.workCompany2),
                        workPeriod2: formatValue(row.workPeriod2),
                        workPosition2: formatValue(row.workPosition2),
                        workCompany3: formatValue(row.workCompany3),
                        workPeriod3: formatValue(row.workPeriod3),
                        workPosition3: formatValue(row.workPosition3),
                        pwd: row.pwd,
                        iP: row.iP,
                        victimOfArmedConflict: row.victimOfArmedConflict,
                        rebelReturnee: row.rebelReturnee,
                        fourP: row.fourP,
                        othersDG: formatValue(row.othersDG),
                        emergencyName: formatValue(row.emergencyName),
                        emergencyContact: formatValue(row.emergencyContact),
                        emergencyAddress: formatValue(row.emergencyAddress),
                        gsisName: formatValue(row.gsisName),
                        gsisRelationship: formatValue(row.gsisRelationship),
                        birthCertificate: row.birthCertificate,
                        transcriptOfRecords: row.transcriptOfRecords,
                        barangayCertificate: row.barangayCertificate,
                        form137138: row.form137138,
                        diploma: row.diploma,
                        othersD: formatValue(row.othersD),
                        certificationFromSchool: row.certificationFromSchool,
                    }}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} autoFocus>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ViewEmployeeModal;
