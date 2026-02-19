import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Typography, Box } from "@mui/material";
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
        return `${totalMonths} MONTH${totalMonths > 1 ? "S" : ""}${
            totalDays > 0 ? ` ${totalDays} DAY${totalDays > 1 ? "S" : ""}` : ""
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

                const totalDisplay = formatDuration(total);

                return (
                    <Box key={year}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                            {year} — <strong>{totalDisplay}</strong>
                        </Typography>

                        {entries.map((entry) => {
                            const start = toDate(entry.startDate);
                            const end = toDate(entry.endDate);
                            const duration = calculateMonthsAndDaysWorked(start, end);
                            const durationDisplay = formatDuration(duration);

                            return (
                                <Box key={entry.id} sx={{ pl: 2 }}>
                                    <Typography variant="body2">
                                        {start && isValid(start)
                                            ? format(start, "MMM d, yyyy").replace(/^([a-zA-Z]+)/, (m) =>
                                                  m.toUpperCase(),
                                              )
                                            : "Invalid"}{" "}
                                        to{" "}
                                        {end && isValid(end)
                                            ? format(end, "MMM d, yyyy").replace(/^([a-zA-Z]+)/, (m) =>
                                                  m.toUpperCase(),
                                              )
                                            : "Invalid"}{" "}
                                        — {durationDisplay} — LGU: <strong>{entry.lgu || "N/A"}</strong>
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                );
            })}
        </Box>
    );
};

export default GIPExperience;