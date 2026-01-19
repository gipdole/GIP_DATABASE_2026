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
} from "@mui/material";
import { isValid, parseISO, format } from "date-fns";

import GIPExperience from "./GIPExperience";
import { groupByPersonYear } from "../utils/summary";

const ViewEmployeeModal = ({ open, onClose, row, allRows }) => {
  if (!row) return null;

  const summaries = useMemo(() => {
    const grouped = groupByPersonYear(allRows).filter(
      (g) => g.name === row.name
    );
    return grouped.sort((a, b) => b.year - a.year);
  }, [allRows, row.name]);

  const formatValue = (value, fallback = "N/A") =>
    value === undefined || value === null || value === "" ? fallback : value;

  const formatDate = (dateStr) => {
    const parsed = parseISO(dateStr);
    return isValid(parsed)
      ? format(parsed, "MMM dd, yyyy").toUpperCase()
      : "Invalid";
  };

const renderField = (label, value) => (
  <Box display="flex" gap={1} mb={1}>
    <Typography component="span" fontWeight="bold">
      {label}:
    </Typography>
    <Typography component="span">
      {label === "Duration" && typeof value === "number"
        ? `${value} MONTH${value !== 1 ? "S" : ""}`
        : label === "Full Name" && typeof value === "string"
        ? value.toUpperCase()
        : label.includes("Date")
        ? formatDate(value)
        : formatValue(value)}
    </Typography>
  </Box>
);


  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="view-employee-title"
      aria-describedby="view-employee-description"
    >
      <DialogTitle id="view-employee-title">VIEW EMPLOYEE</DialogTitle>

      <DialogContent
        dividers
        id="view-employee-description"
        sx={{ maxHeight: "65vh", overflowY: "auto" }}
      >
        {renderField("Full Name", row.name)}
        {renderField("ID", row.idNumber)}
        {renderField("GIP ID", row.gipId)}
        {renderField("Start Date", row.startDate)}
        {renderField("End Date", row.endDate)}
        {renderField("Duration", row.monthsWorked)}
        {renderField("LGU", row.lgu)}
        {renderField("Birthdate", row.birthDate)}

        <Box mt={3}>
          <Typography variant="subtitle1" fontWeight="bold">
            GIP EXPERIENCES:
          </Typography>
          <GIPExperience name={row.name} excludeId={row.idNumber} />
        </Box>

        <Box mt={3}>
          <Typography variant="subtitle1" fontWeight="bold">
            Summary by Year:
          </Typography>
          {summaries.length > 0 ? (
            summaries.map((g) => (
              <Typography key={g.year}>
                {g.year}: <strong>{g.totalMonthsWorked}</strong> MONTH
                {g.totalMonthsWorked !== 1 ? "S" : ""} (
                {g.entries.length} {g.entries.length === 1 ? "ENTRY" : "ENTRIES"})
              </Typography>
            ))
          ) : (
            <Typography color="text.secondary">
              No summary data available.
            </Typography>
          )}
        </Box>
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
