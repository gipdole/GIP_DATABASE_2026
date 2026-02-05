// src/utils/dateUtils.js
import { differenceInMonths, differenceInDays, isValid } from "date-fns";

/**
 * Calculate age in years from date of birth
 * @param {string | Date} dob 
 * @returns {number | null} Age in years
 */
export const calculateAge = (dob) => {
  const date = new Date(dob);
  if (!isValid(date)) return null;
  const diff = new Date() - date;
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

/**
 * Calculate total months worked (legacy)
 * @param {string | Date} start 
 * @param {string | Date} end 
 * @returns {number} Months worked (minimum 1)
 */
export const calculateMonthsWorked = (start, end) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (!isValid(startDate) || !isValid(endDate)) return 0;

  let months = differenceInMonths(endDate, startDate);
  return months < 1 ? 1 : months;
};

/**
 * Calculate months AND days worked between two dates
 * @param {string | Date} start 
 * @param {string | Date} end 
 * @returns {{ months: number, days: number }}
 */
export const calculateMonthsAndDaysWorked = (start, end) => {
  if (!start || !end) return { months: 0, days: 0 };
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (!isValid(startDate) || !isValid(endDate)) return { months: 0, days: 0 };

  // Calculate full months difference
  let months = differenceInMonths(endDate, startDate);

  // Temporary date to calculate leftover days
  let tempDate = new Date(startDate);
  tempDate.setMonth(tempDate.getMonth() + months);

  let days = differenceInDays(endDate, tempDate);

  // If leftover days negative (endDate is before tempDate), adjust
  if (days < 0) {
    months -= 1;
    tempDate.setMonth(tempDate.getMonth() - 1);
    days = differenceInDays(endDate, tempDate);
  }

  // Ensure minimums
  if (months < 0) months = 0;
  if (days < 0) days = 0;

  return { months, days };
};

/**
 * Format months + days into human-readable string
 * @param {{ months: number, days: number }} duration 
 * @returns {string} e.g., "3 MONTHS 12 DAYS" or "15 DAYS"
 */
export const formatDuration = ({ months, days }) => {
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
