// src/utils/dateHelpers.js

/**
 * Gets today's date in YYYY-MM-DD format.
 * @returns {string}
 */
export const getToday = () => new Date().toISOString().split('T')[0];

/**
 * Gets the ISO week number for a given date.
 * @param {Date} d The date object.
 * @returns {string} Year-WeekNumber (e.g., "2023-35")
 */
export const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // (Sunday=0, Monday=1, ..., Saturday=6)
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-${weekNo}`;
};

/**
 * Gets the current month in YYYY-M format.
 * @returns {string}
 */
export const getMonth = () => `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;

/**
 * Checks if today is Monday.
 * @returns {boolean}
 */
export const isMonday = () => new Date().getDay() === 1;

/**
 * Checks if today is the first day of the month.
 * @returns {boolean}
 */
export const isFirstOfMonth = () => new Date().getDate() === 1;
