import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Typography, Box } from "@mui/material";
import { format, isValid } from "date-fns";
import { calculateMonthsAndDaysWorked } from "../utils/dateUtils";

// Utility to format months + days nicely
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

const GIPExperience = ({ name, excludeId }) => {
  const [groupedEntries, setGroupedEntries] = useState({});

  const fetchRelated = useCallback(async () => {
    const snapshot = await getDocs(collection(db, "employees"));
    const entries = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(
        (entry) =>
          entry.name?.toLowerCase().trim() === name?.toLowerCase().trim() &&
          entry.id !== excludeId
      );

    const grouped = {};
    for (const entry of entries) {
      const startDate = entry.startDate ? new Date(entry.startDate) : null;
      const year = startDate && isValid(startDate) ? startDate.getFullYear() : "Unknown";
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(entry);
    }

    Object.keys(grouped).forEach((year) => {
      grouped[year].sort(
        (a, b) => new Date(b.startDate) - new Date(a.startDate)
      );
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

        // Calculate total months and days for the year
        const total = entries.reduce(
          (acc, entry) => {
            const { months, days } = calculateMonthsAndDaysWorked(
              entry.startDate,
              entry.endDate
            );
            acc.months += months;
            acc.days += days;
            return acc;
          },
          { months: 0, days: 0 }
        );

        const totalDisplay = formatDuration(total);

        return (
          <Box key={year} mt={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              {year} — <strong>{totalDisplay}</strong>
            </Typography>

            {entries.map((entry) => {
              const start = new Date(entry.startDate);
              const end = new Date(entry.endDate);
              const duration = calculateMonthsAndDaysWorked(
                entry.startDate,
                entry.endDate
              );
              const durationDisplay = formatDuration(duration);

              return (
                <Box key={entry.id} sx={{ pl: 2, mt: 1 }}>
                  <Typography variant="body2">
                    {isValid(start)
                      ? format(start, "MMM d, yyyy").replace(
                          /^([a-zA-Z]+)/,
                          (m) => m.toUpperCase()
                        )
                      : "Invalid"}{" "}
                    to{" "}
                    {isValid(end)
                      ? format(end, "MMM d, yyyy").replace(
                          /^([a-zA-Z]+)/,
                          (m) => m.toUpperCase()
                        )
                      : "Invalid"}{" "}
                    — LGU: <strong>{entry.lgu || "N/A"}</strong>
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
