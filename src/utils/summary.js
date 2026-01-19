// utils/summary.js

/**
 * Groups employee records by name and year,
 * and computes total months worked for each group.
 *
 * @param {Array<Object>} rows - Employee entries
 * @returns {Array<Object>} Array of { name, year, entries, totalMonthsWorked }
 */
export const groupByPersonYear = (rows = []) => {
  const groups = new Map();

  for (const row of rows) {
    const name = (row.name || '').trim();
    const year = row.year?.toString() || getYearFromDate(row.startDate);

    if (!name || !year) continue;

    const key = `${name}|||${year}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  return Array.from(groups.entries()).map(([key, entries]) => {
    const [name, year] = key.split('|||');
    const totalMonthsWorked = entries.reduce(
      (sum, entry) => sum + (Number(entry.monthsWorked) || 0),
      0
    );
    return { name, year, entries, totalMonthsWorked };
  });
};

/**
 * Extracts 4-digit year from a date string.
 * Returns an empty string if invalid.
 *
 * @param {string|Date} date
 * @returns {string}
 */
const getYearFromDate = (date) => {
  const parsed = new Date(date);
  return isNaN(parsed) ? '' : parsed.getFullYear().toString();
};
