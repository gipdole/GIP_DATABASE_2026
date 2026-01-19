// utils/dateUtils.js

import { differenceInCalendarMonths, isValid, parseISO } from "date-fns";

/**
 * Safely parses a date string or object to a valid Date.
 * @param {string|Date} date - Input date.
 * @returns {Date|null}
 */
const safeParseDate = (date) => {
  if (!date) return null;
  const parsed = typeof date === "string" ? parseISO(date) : new Date(date);
  return isValid(parsed) ? parsed : null;
};

/**
 * Calculates age from a birthdate using the current date.
 * Returns "" if no valid birthdate is provided.
 * 
 * @param {string|Date} birthDate
 * @returns {number|string}
 */
export const calculateAge = (birthDate) => {
  const birth = safeParseDate(birthDate);
  if (!birth) return "";

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();

  const monthDiff = now.getMonth() - birth.getMonth();
  const dayDiff = now.getDate() - birth.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
};

/**
 * Calculates number of full calendar months between start and end dates.
 * Always returns at least 1 month.
 * 
 * @param {string|Date} start
 * @param {string|Date} end
 * @returns {number}
 */
export const calculateMonthsWorked = (start, end) => {
  const startDate = safeParseDate(start);
  const endDate = safeParseDate(end);
  if (!startDate || !endDate) return 1;

  const months = differenceInCalendarMonths(endDate, startDate) + 1;
  return Math.max(months, 1);
};
