import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Typography, Box, Card, CardContent, CardHeader } from "@mui/material";
import { parse, format, isValid } from "date-fns";
import { calculateMonthsAndDaysWorked } from "../utils/dateUtils";

const formatDuration = ({ months, days }) => {
    let totalMonths = months;
    let totalDays = days;

    if (totalDays >= 30) {
        totalMonths += Math.floor(totalDays / 30);
        totalDays = totalDays % 30;
    }

    if (totalMonths > 0) {
        return `${totalMonths} MONTH${totalMonths > 1 ? "S" : ""}${totalDays > 0 ? ` ${totalDays} DAY${totalDays > 1 ? "S" : ""}` : ""
            }`;
    } else {
        return `${totalDays} DAY${totalDays > 1 ? "S" : ""}`;
    }
};

const toDate = (dateStr) => {
    if (!dateStr) return null;
    const parsed = parse(dateStr, "MMMM d, yyyy", new Date());
    if (isValid(parsed)) return parsed;
    const parsed2 = parse(dateStr, "MMM dd, yyyy", new Date());
    return isValid(parsed2) ? parsed2 : null;
};

const GIPExperience = ({ name, excludeId }) => {
    const [groupedEntries, setGroupedEntries] = useState({});

    const fetchRelated = useCallback(async () => {
        const snapshot = await getDocs(collection(db, "employees"));
        const entries = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter(
                (entry) => entry.name?.toLowerCase().trim() === name?.toLowerCase().trim() && entry.id !== excludeId,
            );

        const grouped = {};
        for (const entry of entries) {
            const startDate = toDate(entry.startDate);
            const year = startDate && isValid(startDate) ? startDate.getFullYear() : "Unknown";
            if (!grouped[year]) grouped[year] = [];
            grouped[year].push(entry);
        }

        Object.keys(grouped).forEach((year) => {
            grouped[year].sort((a, b) => toDate(b.startDate) - toDate(a.startDate));
        });

        setGroupedEntries(grouped);
    }, [name, excludeId]);

    useEffect(() => {
        if (name) fetchRelated();
    }, [name, fetchRelated]);

    const years = Object.keys(groupedEntries).sort((a, b) => b - a);

    if (years.length === 0) return null;

    return (
        <Box mt={2}>
            {years.map((year) => {
                const entries = groupedEntries[year];

                const total = entries.reduce(
                    (acc, entry) => {
                        const { months, days } = calculateMonthsAndDaysWorked(
                            toDate(entry.startDate),
                            toDate(entry.endDate),
                        );
                        acc.months += months;
                        acc.days += days;
                        return acc;
                    },
                    { months: 0, days: 0 },
                );

                return (
                    <Box key={year} mb={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                            {year} — <strong>{formatDuration(total)}</strong>
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {entries.map((entry) => {
                                const start = toDate(entry.startDate);
                                const end = toDate(entry.endDate);
                                const durationDisplay = formatDuration(calculateMonthsAndDaysWorked(start, end));

                                return (
                                    <Box key={entry.id} sx={{ display: "flex", flexDirection: "row", gap: 3 }}>
                                        <Card sx={{flex: 1}}>
                                            <CardHeader sx={{
                                                p: 3,
                                                borderTopLeftRadius: 3,
                                                borderTopRightRadius: 3,
                                                background: "linear-gradient(135deg, #55C386 0%, #3FA76A 100%)",
                                                color: "#fff",
                                                boxShadow: "0 6px 25px rgba(85,195,134,0.35)", textAlign: 'center'
                                            }} title='Total GIP Experience' />
                                            <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
                                                <Typography variant="body2">
                                                    {start && isValid(start)
                                                        ? format(start, "MMM d, yyyy").replace(/^([a-zA-Z]+)/, (m) => m.toUpperCase())
                                                        : "Invalid"}{" "}
                                                    to{" "}
                                                    {end && isValid(end)
                                                        ? format(end, "MMM d, yyyy").replace(/^([a-zA-Z]+)/, (m) => m.toUpperCase())
                                                        : "Invalid"}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                        <Card  sx={{flex: 1}}>
                                            <CardHeader sx={{
                                                p: 3,
                                                borderTopLeftRadius: 3,
                                                borderTopRightRadius: 3,
                                                background: "linear-gradient(135deg, #55C386 0%, #3FA76A 100%)",
                                                color: "#fff",
                                                boxShadow: "0 6px 25px rgba(85,195,134,0.35)", textAlign: 'center'
                                            }} title='Employment Duration' />
                                            <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
                                                <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
                                                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                                                        {durationDisplay}
                                                    </Typography>
                                                </CardContent>
                                            </CardContent>
                                        </Card>
                                        <Card  sx={{flex: 1}}>
                                            <CardHeader sx={{
                                                p: 3,
                                                borderTopLeftRadius: 3,
                                                borderTopRightRadius: 3,
                                                background: "linear-gradient(135deg, #55C386 0%, #3FA76A 100%)",
                                                color: "#fff",
                                                boxShadow: "0 6px 25px rgba(85,195,134,0.35)", textAlign: 'center'
                                            }} title='Employment Duration' />
                                            <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
                                                <Typography variant="body2">
                                                    LGU: <strong>{entry.lgu || "N/A"}</strong>
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};

export default GIPExperience;