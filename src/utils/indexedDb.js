// src/utils/indexedDb.js

// Define database name and version
const DB_NAME = 'ZenithTaskTrackerDB';
const DB_VERSION = 1;

// Define object stores and their key paths
const OBJECT_STORES = {
    // Main data stores
    tasks: { keyPath: 'id' },
    notes: { keyPath: 'id' },
    targets: { keyPath: 'id' },
    // Settings store, where 'settingName' is the unique key
    appSettings: { keyPath: 'settingName' }
};

let db = null;

/**
 * Initializes and opens the IndexedDB database.
 * Creates object stores if they don't exist or if the version changes.
 * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
 */
export const initDB = () => {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            for (const storeName in OBJECT_STORES) {
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, OBJECT_STORES[storeName]);
                    console.log(`IndexedDB: Object store '${storeName}' created.`);
                }
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("IndexedDB: Database opened successfully.");
            resolve(db);
        };

        request.onerror = (event) => {
            console.error("IndexedDB: Database error:", event.target.error);
            reject(event.target.error);
        };
    });
};

/**
 * Gets data from a specific object store by key.
 * If no storeName is provided, it defaults to 'appSettings'.
 * @param {string} key The key of the data to retrieve.
 * @param {string} [storeName='appSettings'] The name of the object store.
 * @returns {Promise<any | undefined>} A promise that resolves with the data, or undefined if not found.
 */
export const getData = async (key, storeName = 'appSettings') => {
    try {
        const database = await initDB();
        const transaction = database.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                console.error(`IndexedDB: Error getting data for key '${key}' from store '${storeName}':`, request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error(`IndexedDB: Failed to get data for key '${key}' from store '${storeName}':`, error);
        throw error;
    }
};

/**
 * Puts (adds or updates) data into a specific object store.
 * If no storeName is provided, it defaults to 'appSettings'.
 * @param {string} key The key for the data (for appSettings store). For other stores, it's part of the value object.
 * @param {any} value The data to store.
 * @param {string} [storeName='appSettings'] The name of the object store.
 * @returns {Promise<void>} A promise that resolves when the data is stored.
 */
export const putData = async (key, value, storeName = 'appSettings') => {
    try {
        const database = await initDB();
        const transaction = database.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        // For 'appSettings', the key is 'settingName'. For other stores, the key is within the value (e.g., value.id).
        const dataToStore = storeName === 'appSettings' ? { settingName: key, value: value } : value;
        const request = store.put(dataToStore);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve();
            request.onerror = () => {
                console.error(`IndexedDB: Error putting data for key '${key}' into store '${storeName}':`, request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error(`IndexedDB: Failed to put data for key '${key}' into store '${storeName}':`, error);
        throw error;
    }
};

/**
 * Removes data from a specific object store by key.
 * @param {string} key The key of the data to remove.
 * @param {string} storeName The name of the object store.
 * @returns {Promise<void>} A promise that resolves when the data is removed.
 */
export const deleteData = async (key, storeName) => {
    try {
        const database = await initDB();
        const transaction = database.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve();
            request.onerror = () => {
                console.error(`IndexedDB: Error deleting data for key '${key}' from store '${storeName}':`, request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error(`IndexedDB: Failed to delete data for key '${key}' from store '${storeName}':`, error);
        throw error;
    }
};

/**
 * Clears all data from a specific object store.
 * @param {string} storeName The name of the object store to clear.
 * @returns {Promise<void>} A promise that resolves when the store is cleared.
 */
export const clearStore = async (storeName) => {
    try {
        const database = await initDB();
        const transaction = database.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log(`IndexedDB: Store '${storeName}' cleared successfully.`);
                resolve();
            };
            request.onerror = () => {
                console.error(`IndexedDB: Error clearing store '${storeName}':`, request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error(`IndexedDB: Failed to clear store '${storeName}':`, error);
        throw error;
    }
};

/**
 * Retrieves all data from a specific object store.
 * @param {string} storeName The name of the object store.
 * @returns {Promise<Array<any>>} A promise that resolves with an array of all data in the store.
 */
export const getAllData = async (storeName) => {
    try {
        const database = await initDB();
        const transaction = database.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                // For appSettings, we only want the 'value' part
                if (storeName === 'appSettings') {
                    const settings = {};
                    request.result.forEach(item => {
                        settings[item.settingName] = item.value;
                    });
                    resolve(settings);
                } else {
                    resolve(request.result);
                }
            };
            request.onerror = () => {
                console.error(`IndexedDB: Error getting all data from store '${storeName}':`, request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error(`IndexedDB: Failed to get all data from store '${storeName}':`, error);
        throw error;
    }
};

/**
 * Exports all data from the IndexedDB to a single JSON object.
 * @returns {Promise<Object>} A promise that resolves with a JSON object containing all app data.
 */
export const exportAllData = async () => {
    const exportedData = {};
    for (const storeName in OBJECT_STORES) {
        let data = await getAllData(storeName);
        // Special handling for appSettings to flatten it
        if (storeName === 'appSettings') {
            exportedData[storeName] = data;
        } else {
            exportedData[storeName] = data;
        }
    }
    return exportedData;
};

/**
 * Imports data from a JSON object into IndexedDB.
 * This will overwrite existing data in the respective stores.
 * @param {Object} data The JSON object containing data to import.
 * @returns {Promise<void>} A promise that resolves when all data is imported.
 */
export const importAllData = async (data) => {
    const database = await initDB();
    const transaction = database.transaction(Object.keys(OBJECT_STORES), 'readwrite');

    try {
        // Clear all existing stores first
        for (const storeName in OBJECT_STORES) {
            const store = transaction.objectStore(storeName);
            await new Promise((resolve, reject) => {
                const req = store.clear();
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            });
        }

        // Import new data
        for (const storeName in data) {
            if (OBJECT_STORES[storeName]) { // Only import into known stores
                const store = transaction.objectStore(storeName);
                const items = data[storeName];

                if (storeName === 'appSettings') {
                    // appSettings is an object, convert to array of {settingName, value}
                    for (const settingName in items) {
                        await new Promise((resolve, reject) => {
                            const req = store.put({ settingName: settingName, value: items[settingName] });
                            req.onsuccess = () => resolve();
                            req.onerror = () => reject(req.error);
                        });
                    }
                } else if (Array.isArray(items)) {
                    // Other stores are arrays of objects
                    for (const item of items) {
                        await new Promise((resolve, reject) => {
                            const req = store.put(item);
                            req.onsuccess = () => resolve();
                            req.onerror = () => reject(req.error);
                        });
                    }
                } else {
                    console.warn(`IndexedDB: Skipping import for '${storeName}' due to unexpected data format.`);
                }
            } else {
                console.warn(`IndexedDB: Skipping import for unknown store '${storeName}'.`);
            }
        }

        await new Promise((resolve, reject) => {
            transaction.oncomplete = () => {
                console.log("IndexedDB: Data imported successfully.");
                resolve();
            };
            transaction.onerror = () => {
                console.error("IndexedDB: Import transaction failed:", transaction.error);
                reject(transaction.error);
            };
        });
    } catch (error) {
        console.error("IndexedDB: Error during import process:", error);
        throw error;
    }
};
