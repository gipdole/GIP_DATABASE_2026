// utils/summary.js

/**
 * Groups employee records by name and computes
 * total GIP experience across all entries (in days).
 *
 * @param {Array<Object>} rows - Employee entries
 * @returns {Array<Object>} Array of { name, entries, totalDaysWorked }
 */
export const groupByPersonTotal = (rows = []) => {
  const groups = new Map();

  for (const row of rows) {
    const name = (row.name || '').trim();
    if (!name) continue;

    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(row);
  }

  return Array.from(groups.entries()).map(([name, entries]) => {
    const totalDaysWorked = entries.reduce(
      (sum, entry) => sum + (Number(entry.daysWorked) || 0),
      0
    );
    return { name, entries, totalDaysWorked };
  });
};
