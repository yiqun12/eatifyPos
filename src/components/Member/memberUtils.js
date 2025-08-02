/**
 * Member system utility functions
 * Separated to avoid circular dependencies
 */

import firebase from 'firebase/compat/app';
import { DateTime } from 'luxon';
import { lookup } from 'zipcode-to-timezone';

// Global store names cache for synchronized access
let globalStoreNames = new Map();
// Global store timezone cache for efficient access
let globalStoreTimezones = new Map();

/**
 * Load store groups configuration from Firebase (direct query like Navbar.js)
 * @returns {Promise<Object>} Store groups configuration
 */
export const loadStoreGroups = async () => {
  try {
    const currentUserId = firebase.auth().currentUser?.uid;
    if (!currentUserId) {
      return {};
    }

    // Direct Firebase query, no cache - same approach as Navbar.js
    const doc = await firebase
      .firestore()
      .collection('stripe_customers')
      .doc(currentUserId)
      .collection('system_config')
      .doc('store_groups')
      .get();
    
    if (doc.exists) {
      const data = doc.data();
      return data.groups || {};
    } else {
      return {};
    }
  } catch (error) {
    console.error('Error loading store groups:', error);
    return {};
  }
};

/**
 * Get store group information for the given store
 * @param {string} storeId - Current store ID
 * @returns {Promise<Object>} Object with groupId and stores array
 */
export const getStoreGroup = async (storeId) => {
  const storeGroups = await loadStoreGroups();
  
  // Find which group this store belongs to
  for (const [groupId, stores] of Object.entries(storeGroups)) {
    if (stores.includes(storeId)) {
      return { groupId, stores };
    }
  }
  
  // If not found in any group, treat as independent store
  return { groupId: `group_${storeId}`, stores: [storeId] };
};




/**
 * Load all store names for the current user (direct query like Navbar.js)
 * @returns {Promise<Map>} Map of storeId -> store info (name, storeNameCHI, zipCode)
 */
export const loadStoreNames = async () => {
  try {
    const currentUserId = firebase.auth().currentUser?.uid;
    if (!currentUserId) {
      console.warn('User not authenticated, cannot load store names');
      return new Map();
    }

    // Direct query like Navbar.js fetchStorelist() - no cache
    const snapshot = await firebase
      .firestore()
      .collection('stripe_customers')
      .doc(currentUserId)
      .collection('TitleLogoNameContent')
      .get();

    const storeNamesMap = new Map();
    snapshot.forEach(doc => {
      const data = doc.data();
      storeNamesMap.set(doc.id, {
        id: doc.id,
        name: data.Name || doc.id,
        storeNameCHI: data.storeNameCHI || data.Name || doc.id,
        zipCode: data.ZipCode // Include ZipCode for timezone lookup
      });
    });

    console.log("Loaded store names:", storeNamesMap);
    
    // Update global cache for sync access
    globalStoreNames = storeNamesMap;
    
    // Calculate and cache timezones for all stores
    globalStoreTimezones.clear();
    storeNamesMap.forEach((storeInfo, storeId) => {
      if (storeInfo.zipCode) {
        const timezone = getTimeZoneByZip(storeInfo.zipCode);
        globalStoreTimezones.set(storeId, timezone);
      } else {
        globalStoreTimezones.set(storeId, DEFAULT_TIMEZONE);
      }
    });
    
    console.log("Cached store timezones:", globalStoreTimezones);
    
    return storeNamesMap;
  } catch (error) {
    console.error('Error loading store names:', error);
    return new Map();
  }
};

/**
 * Get store name by storeId
 * @param {string} storeId 
 * @returns {Promise<string>} Store name
 */
export const getStoreName = async (storeId) => {
  const storeNames = await loadStoreNames();
  const storeInfo = storeNames.get(storeId);
  
  // Check language preference for Chinese/English name
  const isChineseLanguage = localStorage.getItem("Google-language")?.includes("Chinese") || 
                           localStorage.getItem("Google-language")?.includes("中");
  
  if (storeInfo) {
    return isChineseLanguage ? storeInfo.storeNameCHI : storeInfo.name;
  }
  
  return storeId; // Fallback to ID if name not found
};

/**
 * Get store name synchronously (fallback to storeId if not available)
 * @param {string} storeId 
 * @returns {string} Store name or storeId
 */
export const getStoreNameSync = (storeId) => {
  const storeInfo = globalStoreNames.get(storeId);
  
  if (storeInfo) {
    // Check language preference for Chinese/English name
    const isChineseLanguage = localStorage.getItem("Google-language")?.includes("Chinese") || 
                             localStorage.getItem("Google-language")?.includes("中") ||
                             navigator.language?.includes('zh') || 
                             navigator.language?.includes('Chinese');
    
    return isChineseLanguage ? (storeInfo.storeNameCHI || storeInfo.name) : storeInfo.name;
  }
  
  return storeId; // Fallback to ID if name not found
};

/**
 * Initialize store names cache (should be called when components mount)
 * @returns {Promise<Map>} Store names map
 */
export const initializeStoreNames = async () => {
  try {
    const storeNames = await loadStoreNames();
    return storeNames;
  } catch (error) {
    console.error('Error initializing store names:', error);
    return new Map();
  }
};

/**
 * Get store name with proper formatting (replacement for getStoreName helper)
 * @param {string} storeId 
 * @returns {string} Formatted store name
 */
export const getFormattedStoreName = (storeId) => {
  return getStoreNameSync(storeId);
};

/**
 * Time formatting utilities
 * Synchronized with Terminal.js and Navbar.js time handling
 */

// Default timezone matching Terminal.js and Navbar.js
const DEFAULT_TIMEZONE = "America/New_York";

/**
 * Get timezone ID from ZIP code (same as Navbar.js)
 * @param {string} zipCode - ZIP code to lookup
 * @returns {string} Timezone ID
 */
export const getTimeZoneByZip = (zipCode) => {
  try {
    // Use the library to find the timezone ID from the ZIP code
    const timeZoneId = lookup(zipCode);
    return timeZoneId || DEFAULT_TIMEZONE;
  } catch (error) {
    console.error("Error looking up timezone for ZIP code:", zipCode, error);
    return DEFAULT_TIMEZONE;
  }
};

/**
 * Get store timezone from cache (synchronous)
 * @param {string} storeId - Store ID to get timezone for
 * @returns {string} Timezone ID
 */
export const getStoreTimezoneSync = (storeId) => {
  const timezone = globalStoreTimezones.get(storeId);
  return timezone || DEFAULT_TIMEZONE;
};

/**
 * Get current store's timezone from cache
 * @param {string} storeId - Current store ID
 * @returns {string} Timezone ID
 */
export const getCurrentStoreTimezone = (storeId) => {
  if (!storeId) {
    console.warn("No storeId provided for timezone lookup, using default");
    return DEFAULT_TIMEZONE;
  }
  return getStoreTimezoneSync(storeId);
};

/**
 * Get specific store's timezone (now uses cache for efficiency)
 * @param {string} storeId - Store ID to get timezone for
 * @returns {Promise<string>} Timezone ID
 */
export const getStoreTimezone = async (storeId) => {
  // Use cached timezone if available
  const cachedTimezone = globalStoreTimezones.get(storeId);
  if (cachedTimezone) {
    return cachedTimezone;
  }
  
  // If not in cache, try to get from loaded store data
  const storeInfo = globalStoreNames.get(storeId);
  if (storeInfo && storeInfo.zipCode) {
    const timezone = getTimeZoneByZip(storeInfo.zipCode);
    globalStoreTimezones.set(storeId, timezone); // Cache it
    return timezone;
  }
  
  console.warn(`No timezone data found for store ${storeId}, using default`);
  return DEFAULT_TIMEZONE;
};

/**
 * Get formatted current time with timezone
 * @param {string} timeZone - Timezone string (default: America/New_York)
 * @returns {string} Formatted time string
 */
export const getFormattedTime = (timeZone = DEFAULT_TIMEZONE) => {
  try {
    const now = DateTime.now().setZone(timeZone);
    return now.toFormat('yyyy-M-d HH:mm:ss');
  } catch (error) {
    console.error("Invalid timezone, using local time:", error);
    const now = DateTime.now();
    return now.toFormat('yyyy-M-d HH:mm:ss');
  }
};

/**
 * Convert Firebase timestamp to formatted time string
 * @param {firebase.firestore.Timestamp} timestamp - Firebase timestamp
 * @param {string} timeZone - Timezone string (default: America/New_York)
 * @returns {string} Formatted time string
 */
export const formatFirebaseTimestamp = (timestamp, timeZone = DEFAULT_TIMEZONE) => {
  if (!timestamp) {
    return 'N/A';
  }
  
  try {
    // Convert Firebase timestamp to Date, then to luxon DateTime
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const dateTime = DateTime.fromJSDate(date).setZone(timeZone);
    return dateTime.toFormat('yyyy-M-d HH:mm:ss');
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    try {
      // Fallback to local time
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const dateTime = DateTime.fromJSDate(date);
      return dateTime.toFormat('yyyy-M-d HH:mm:ss');
    } catch (fallbackError) {
      console.error("Fallback formatting failed:", fallbackError);
      return 'Invalid Date';
    }
  }
};

/**
 * Get user's timezone preference or default
 * Uses specific store's timezone based on ZIP code
 * @param {string} storeId - Store ID to get timezone for
 * @returns {string} Timezone string
 */
export const getUserTimezone = (storeId) => {
  if (!storeId) {
    console.warn("No storeId provided for getUserTimezone, using default");
    return DEFAULT_TIMEZONE;
  }
  
  try {
    const storeTimezone = getCurrentStoreTimezone(storeId);
    if (storeTimezone && storeTimezone !== DEFAULT_TIMEZONE) {
      return storeTimezone;
    }
  } catch (error) {
    console.error("Error getting user timezone:", error);
  }
  
  // Fallback to default timezone
  return DEFAULT_TIMEZONE;
};

/**
 * Format timestamp for display in member records
 * @param {firebase.firestore.Timestamp|Date|string} timestamp 
 * @param {string} storeId - Store ID to get timezone for (optional, uses default if not provided)
 * @returns {string} User-friendly formatted time
 */
export const formatRecordTimestamp = (timestamp, storeId = null) => {
  const userTimezone = storeId ? getUserTimezone(storeId) : DEFAULT_TIMEZONE;
  return formatFirebaseTimestamp(timestamp, userTimezone);
};

/**
 * Get current time display string (same format as Navbar.js)
 * @param {string} storeId - Store ID to get timezone for (optional, uses default if not provided)
 * @returns {string} Formatted current time (M/d HH:mm:ss)
 */
export const getCurrentTimeDisplay = (storeId = null) => {
  const timeZone = storeId ? getUserTimezone(storeId) : DEFAULT_TIMEZONE;
  try {
    const now = DateTime.now().setZone(timeZone);
    // Use the same format as Navbar.js: 'M/d HH:mm:ss'
    return now.toFormat('M/d HH:mm:ss');
  } catch (error) {
    console.error("Invalid timezone, using local time:", error);
    const now = DateTime.now();
    return now.toFormat('M/d HH:mm:ss');
  }
};

/**
 * Generate consistent timestamp for member system
 * Uses local time instead of Firebase serverTimestamp for consistency with other features
 * @param {string} storeId - Store ID to get timezone for (optional)
 * @returns {Date} Local timestamp
 */
export const generateTimestamp = (storeId = null) => {
  // Use local time for consistency with other system features
  return new Date();
};

/**
 * Generate Firebase-compatible timestamp object
 * @param {string} storeId - Store ID to get timezone for (optional) 
 * @returns {firebase.firestore.Timestamp} Firebase timestamp
 */
export const generateFirebaseTimestamp = (storeId = null) => {
  const localTime = generateTimestamp(storeId);
  return firebase.firestore.Timestamp.fromDate(localTime);
};

/**
 * Member system utility functions
 */
export const memberUtils = {
  /**
   * Generate member document ID based on store and phone
   * @param {string} storeId - Store ID
   * @param {string} phone - Member phone number
   * @returns {string} Document ID
   */
  generateMemberId: (storeId, phone) => `${storeId}_member_${phone}`,

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} Whether phone number is valid
   */
  validatePhone: (phone) => {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Calculate recharge bonus (deprecated - now manual input)
   * @param {number} amount - Recharge amount
   * @returns {number} Bonus amount (always 0 for manual input)
   */
  calculateBonus: (amount) => {
    return 0; // Manual input mode - no automatic bonus calculation
  },

  /**
   * Format member status for display
   * @param {string} status - Member status
   * @returns {string} Formatted status
   */
  formatStatus: (status) => {
    const statusMap = {
      'active': 'Active',
      'inactive': 'Inactive',
      'suspended': 'Suspended'
    };
    return statusMap[status] || status;
  }
};



/**
 * Predefined recharge packages (deprecated - now using manual input)
 * Kept for compatibility
 */
export const rechargePackages = [];

/**
 * Member system configuration
 */
export const memberConfig = {
  adminPassword: '1234', // Fixed admin password
  currencySymbol: '$', // Currency symbol
  decimalPlaces: 2, // Number of decimal places for currency
  minRechargeAmount: 10, // Minimum recharge amount
  maxRechargeAmount: 5000, // Maximum recharge amount
  sessionTimeout: 30 * 60 * 1000, // 30 minutes session timeout
};