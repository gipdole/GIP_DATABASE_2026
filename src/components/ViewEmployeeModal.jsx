// src/components/ViewEmployeeModal.jsx
import React, { useMemo } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    Box,
    Card,
    CardContent,
    CardHeader,
} from "@mui/material";
import { isValid, parseISO, format } from "date-fns";

import GIPExperience from "./GIPExperience";
import { calculateMonthsAndDaysWorked, formatDuration } from "../utils/dateUtils";

const ViewEmployeeModal = ({ open, onClose, row, allRows }) => {
    if (!row) return null;

    // Top Duration field
    const durationTop = useMemo(() => {
        return formatDuration(calculateMonthsAndDaysWorked(row.startDate, row.endDate));
    }, [row.startDate, row.endDate]);

    // Total GIP experience across all entries
    const totalExperience = useMemo(() => {
        const entries = allRows.filter((r) => r.name?.toLowerCase().trim() === row.name?.toLowerCase().trim());

        const total = entries.reduce(
            (acc, entry) => {
                const { months, days } = calculateMonthsAndDaysWorked(entry.startDate, entry.endDate);
                acc.months += months;
                acc.days += days;
                return acc;
            },
            { months: 0, days: 0 },
        );

        return formatDuration(total);
    }, [allRows, row.name]);

    const formatValue = (value, fallback = "N/A") =>
        value === undefined || value === null || value === "" ? fallback : value;

    const formatDate = (dateStr) => {
        const parsed = parseISO(dateStr);
        return isValid(parsed) ? format(parsed, "MMM dd, yyyy").toUpperCase() : "Invalid";
    };

    const renderValue = (label, value) => {
        if (label === "Full Name" && typeof value === "string") {
            return value.toUpperCase();
        }

        if (label.includes("Date")) {
            return formatDate(value);
        }

        return formatValue(value);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
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
                sx={{ maxHeight: "65vh", overflowY: "auto", display: "flex", justifyContent: "space-between", gap: 3 }}
            >
                <Card
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        width: "50%",
                    }}
                    variant="outlined"
                >
                    <CardHeader title={row.gipId} sx={{ backgroundColor: "#55C386" }} />
                    <CardContent>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                width: "100%",
                                justifyContent: "space-between",
                                marginBottom: 1,
                            }}
                        >
                            <Typography sx={{ fontSize: "1.125rem" }}>Full Name</Typography>
                            <Typography sx={{ fontSize: "1.125rem", fontWeight: "bold" }}>
                                {row.name.toUpperCase()}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                width: "100%",
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography>Birthdate</Typography>
                            <Typography sx={{ fontWeight: "bold" }}>{formatDate(row.birthDate)}</Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                width: "100%",
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography>Start Date</Typography>
                            <Typography sx={{ fontWeight: "bold" }}>{formatDate(row.startDate)}</Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                width: "100%",
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography>End Date</Typography>
                            <Typography sx={{ fontWeight: "bold" }}>{formatDate(row.endDate)}</Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                width: "100%",
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography>Duration</Typography>
                            <Typography sx={{ fontWeight: "bold" }}>{durationTop}</Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                width: "100%",
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography>LGU</Typography>
                            <Typography sx={{ fontWeight: "bold" }}>{row.lgu}</Typography>
                        </Box>
                    </CardContent>
                </Card>

                <Card
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        width: "50%",
                    }}
                    variant="outlined"
                >
                    <CardHeader title="GIP EXPERIENCES" sx={{ backgroundColor: "#55C386" }} />
                    <CardContent
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                            justifyContent: "space-between",
                            marginBottom: 1,
                        }}
                    >
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold"></Typography>
                            <GIPExperience name={row.name} excludeId={row.idNumber} />
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Total GIP Experience:
                            </Typography>
                            <Typography>
                                <strong>{totalExperience}</strong>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
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
