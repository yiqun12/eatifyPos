/**
 * Member system utility functions
 * Separated to avoid circular dependencies
 */

import firebase from 'firebase/compat/app';

// Store groups configuration cache
let cachedStoreGroups = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/**
 * Load store groups configuration from Firebase
 * @returns {Promise<Object>} Store groups configuration
 */
export const loadStoreGroups = async () => {
  try {
    // Check cache first
    if (cachedStoreGroups && cacheTimestamp && 
        (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      return cachedStoreGroups;
    }

    // Use the correct Firebase path structure with permissions
    const currentUserId = firebase.auth().currentUser?.uid;
    const doc = await firebase
      .firestore()
      .collection('stripe_customers')
      .doc(currentUserId)
      .collection('system_config')
      .doc('store_groups')
      .get();
    
    if (doc.exists) {
      const data = doc.data();
      cachedStoreGroups = data.groups || {};
      cacheTimestamp = Date.now();
      return cachedStoreGroups;
    } else {
      // Return empty configuration if document doesn't exist
      cachedStoreGroups = {};
      cacheTimestamp = Date.now();
      return cachedStoreGroups;
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
 * Get store group synchronously using cached data
 * @param {string} storeId - Current store ID
 * @returns {Object} Object with groupId and stores array
 */
export const getStoreGroupSync = (storeId) => {
  if (!cachedStoreGroups) {
    // If no cache, treat as independent store
    return { groupId: `group_${storeId}`, stores: [storeId] };
  }
  
  // Find which group this store belongs to
  for (const [groupId, stores] of Object.entries(cachedStoreGroups)) {
    if (stores.includes(storeId)) {
      return { groupId, stores };
    }
  }
  
  // If not found in any group, treat as independent store
  return { groupId: `group_${storeId}`, stores: [storeId] };
};

/**
 * Clear the store groups cache
 * Call this when store group configuration is updated
 */
export const clearStoreGroupsCache = () => {
  cachedStoreGroups = null;
  cacheTimestamp = null;
};

/**
 * Cache for store names to avoid repeated Firestore queries
 */
let cachedStoreNames = new Map();
let storeNamesCacheTimestamp = null;
const STORE_NAMES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Load all store names for the current user
 * @returns {Promise<Map>} Map of storeId -> store info (name, storeNameCHI)
 */
export const loadStoreNames = async () => {
  try {
    // Check cache first
    if (cachedStoreNames && storeNamesCacheTimestamp &&
        Date.now() - storeNamesCacheTimestamp < STORE_NAMES_CACHE_DURATION) {
      return cachedStoreNames;
    }

    const currentUserId = firebase.auth().currentUser?.uid;
    if (!currentUserId) {
      console.warn('User not authenticated, cannot load store names');
      return new Map();
    }

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
        storeNameCHI: data.storeNameCHI || data.Name || doc.id
      });
    });

    // Update cache
    cachedStoreNames = storeNamesMap;
    storeNamesCacheTimestamp = Date.now();

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
 * Get store names synchronously (use cached data)
 * @param {string} storeId 
 * @returns {string} Store name or storeId if not cached
 */
export const getStoreNameSync = (storeId) => {
  if (!cachedStoreNames || !cachedStoreNames.has(storeId)) {
    return storeId;
  }
  
  const storeInfo = cachedStoreNames.get(storeId);
  const isChineseLanguage = localStorage.getItem("Google-language")?.includes("Chinese") || 
                           localStorage.getItem("Google-language")?.includes("中");
  
  return isChineseLanguage ? storeInfo.storeNameCHI : storeInfo.name;
};

/**
 * Clear store names cache
 */
export const clearStoreNamesCache = () => {
  cachedStoreNames = new Map();
  storeNamesCacheTimestamp = null;
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