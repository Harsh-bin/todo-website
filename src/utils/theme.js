// src/utils/theme.js
import { getData, putData } from './indexedDb.js';

const THEME_KEY = 'theme'; // Key for storing theme preference in appSettings store

/**
 * Retrieves the current theme preference from IndexedDB.
 * @returns {Promise<string>} A promise that resolves with 'dark' or 'light'.
 */
export const getTheme = async () => {
    try {
        const storedTheme = await getData(THEME_KEY);
        return storedTheme || 'dark'; // Default to dark if no theme is stored
    } catch (error) {
        console.error("Error getting theme from IndexedDB:", error);
        return 'dark'; // Fallback to dark theme on error
    }
};

/**
 * Saves the theme preference to IndexedDB and applies it to the HTML document.
 * @param {string} theme The theme to set ('dark' or 'light').
 * @returns {Promise<void>}
 */
export const saveTheme = async (theme) => {
    try {
        document.documentElement.setAttribute('data-theme', theme);
        await putData(THEME_KEY, theme);
    } catch (error) {
        console.error("Error saving theme to IndexedDB:", error);
    }
};

/**
 * Toggles the current theme between 'dark' and 'light' and saves the new preference.
 * @returns {Promise<void>}
 */
export const toggleTheme = async () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    await saveTheme(newTheme);
};
