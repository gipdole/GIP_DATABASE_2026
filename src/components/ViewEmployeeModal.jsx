// src/components/ViewEmployeeModal.jsx
import { useMemo, useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    // Typography,
    Button,
    Box,
    Tabs,
    Tab,
    Card,
    CardHeader,
    CardContent,
    Grid
} from "@mui/material";
import { isValid, parseISO, format, parse } from "date-fns";

// import GIPExperience from "./GIPExperience";
import { calculateMonthsAndDaysWorked, formatDuration } from "../utils/dateUtils";
import { fillGIPInfoPDF } from "../utils/fillPdf";
import gipEmployeeForm from "../assets/GIPEmployeeForm.pdf";
import GIPExperience from "./GIPExperience";

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

function CustomTabPanel({ children, value, index }) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
        </div>
    );
}

const ViewEmployeeModal = ({ open, onClose, row, allRows }) => {
    const [tab, setTab] = useState(0);

    console.log("Before", row)
    const toDate = (dateStr) => {
        if (!dateStr) return null;
        const parsed = parse(dateStr, "MMMM d, yyyy", new Date());
        if (isValid(parsed)) return parsed;
        // fallback for "Jan 04, 2002" format (MMM dd, yyyy)
        const parsed2 = parse(dateStr, "MMM dd, yyyy", new Date());
        return isValid(parsed2) ? parsed2 : null;
    };

    const durationTop = useMemo(() => {
        if (!row) return "";
        return formatDuration(calculateMonthsAndDaysWorked(toDate(row.startDate), toDate(row.endDate)));
    }, [row?.startDate, row?.endDate]);

    const totalExperience = useMemo(() => {
        if (!row) return "";
        const entries = allRows.filter((r) => r.name?.toLowerCase().trim() === row.name?.toLowerCase().trim());
        const total = entries.reduce(
            (acc, entry) => {
                const { months, days } = calculateMonthsAndDaysWorked(toDate(entry.startDate), toDate(entry.endDate));
                acc.months += months;
                acc.days += days;
                return acc;
            },
            { months: 0, days: 0 },
        );
        return formatDuration(total);
    }, [allRows, row?.name]);

    if (!row) return null;

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

            <DialogContent dividers sx={{ display: "flex", flexDirection: "column", p: 0, overflow: "hidden" }}>
                {/* Tab Bar */}
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                        <Tab label="GIP Form" />
                        <Tab label="Experience Summary" />
                    </Tabs>
                </Box>

                {/* Tab 0: PDF */}
                <CustomTabPanel value={tab} index={0}>

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
                </CustomTabPanel>
                {/* Tab 1: Experience Summary — customize freely */}
                <CustomTabPanel value={tab} index={1}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

                        {/* Experience Card */}
                        <Box
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                backgroundColor: "#ffffff",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                                borderLeft: "6px solid #55C386",
                            }}
                        >
                            <Box sx={{ fontSize: "1.1rem", fontWeight: 600, mb: 2 }}>
                                Experience Summary
                            </Box>

                            <GIPExperience name={row.name} excludeId={row.idNumber} />
                        </Box>

                        <Card>
                            <CardHeader
                                sx={{ fontWeight: 'bold', textAlign: 'center' }}
                                title='Experience Summary'
                            />
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} size={4}>
                                        <Card>
                                            <CardHeader sx={{
                                                p: 3,
                                                borderRadius: 3,
                                                background: "linear-gradient(135deg, #55C386 0%, #3FA76A 100%)",
                                                color: "#fff",
                                                boxShadow: "0 6px 25px rgba(85,195,134,0.35)", textAlign: 'center'
                                            }} title='Total GIP Experience' />
                                            <CardContent>

                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} size={4}>
                                        <Card>
                                            <CardHeader sx={{
                                                p: 3,
                                                borderRadius: 3,
                                                background: "linear-gradient(135deg, #55C386 0%, #3FA76A 100%)",
                                                color: "#fff",
                                                boxShadow: "0 6px 25px rgba(85,195,134,0.35)", textAlign: 'center'
                                            }} title='Employment Duration' />
                                            <CardContent>

                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} size={4}>
                                        <Card>
                                            <CardHeader sx={{
                                                p: 3,
                                                borderRadius: 3,
                                                background: "linear-gradient(135deg, #55C386 0%, #3FA76A 100%)",
                                                color: "#fff",
                                                boxShadow: "0 6px 25px rgba(85,195,134,0.35)", textAlign: 'center'
                                            }} title='Local Government Unit' />
                                            <CardContent>

                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Total Experience Highlight */}
                        <Box
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                background: "linear-gradient(135deg, #55C386 0%, #3FA76A 100%)",
                                color: "#fff",
                                boxShadow: "0 6px 25px rgba(85,195,134,0.35)",
                            }}
                        >
                            <Box sx={{ fontSize: "1.25rem", opacity: 0.9 }}>
                                Total GIP Experience
                            </Box>

                            <Box
                                sx={{
                                    fontSize: "1.8rem",
                                    fontWeight: 700,
                                    mt: 1,
                                    letterSpacing: 1,
                                }}
                            >
                                {totalExperience}
                            </Box>
                        </Box>

                    </Box>
                </CustomTabPanel>

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
