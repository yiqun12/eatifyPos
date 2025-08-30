import { db } from '../firebase/index';
import { 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot, 
  runTransaction, 
  serverTimestamp,
  collection,
  updateDoc,
  deleteField 
} from 'firebase/firestore';

/**
 * Shared Cart Manager - Handles multi-user shared cart for customer scan-to-order
 * Separated from admin cart (inStore_shop_cart.js) to avoid affecting backend logic
 */
class SharedCartManager {
  constructor(store, table) {
    this.store = store;
    this.table = table;
    this.cartId = `${store}-${table}`;
    // Local client sequence for ordering our own operations
    this.clientSeq = 1;
    this.cartRef = doc(db, 'SharedCarts', this.cartId);
    this.userId = this.generateOrGetUserId();
    this.isInitialized = false;
    
    console.log('SharedCartManager initialized:', {
      store, 
      table, 
      cartId: this.cartId, 
      userId: this.userId
    });
  }

  /**
   * Generate or get unique user ID
   */
  generateOrGetUserId() {
    const userIdKey = 'shared-cart-user-id';
    let userId = localStorage.getItem(userIdKey);
    
    if (!userId) {
      // Generate user ID with timestamp + random string
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substr(2, 9);
      userId = `user_${timestamp}_${randomStr}`;
      localStorage.setItem(userIdKey, userId);
    }
    
    return userId;
  }

  /**
   * Initialize cart - create if not exists
   */
  async initializeCart() {
    if (this.isInitialized) return;

    try {
      const initialCartData = {
        store: this.store,
        table: this.table,
        cartItems: [],
        users: {
          [this.userId]: {
            joinedAt: serverTimestamp(),
            lastActive: serverTimestamp(),
            isActive: true
          }
        },
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        version: 1
      };

      // Use transaction to ensure safe creation
      await runTransaction(db, async (transaction) => {
        const cartDoc = await transaction.get(this.cartRef);
        
        if (!cartDoc.exists()) {
          // Cart doesn't exist, create new one
          transaction.set(this.cartRef, initialCartData);
          console.log('Created new shared cart:', this.cartId);
        } else {
          // Cart already exists, update user info
          const existingData = cartDoc.data();
          const updatedUsers = {
            ...existingData.users,
            [this.userId]: {
              joinedAt: existingData.users?.[this.userId]?.joinedAt || serverTimestamp(),
              lastActive: serverTimestamp(),
              isActive: true
            }
          };
          
          transaction.update(this.cartRef, {
            users: updatedUsers,
            lastUpdated: serverTimestamp()
          });
          console.log('Updated existing shared cart with new user:', this.userId);
        }
      });

      this.isInitialized = true;
      console.log('SharedCart initialized successfully');
    } catch (error) {
      console.error('Error initializing shared cart:', error);
      throw error;
    }
  }

  /**
   * Listen to cart changes
   * @param {Function} callback - Callback function that receives cartItems array
   * @returns {Function} - Function to unsubscribe from listening
   */
  listenToCart(callback) {
    console.log('Starting to listen to cart changes...');
    
    return onSnapshot(this.cartRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const cartItems = data.cartItems || [];
        
        console.log('Cart updated:', {
          cartId: this.cartId,
          itemCount: cartItems.length,
          version: data.version,
          lastUpdated: data.lastUpdated
        });
        
        // Also update local cache as backup
        this.updateLocalBackup(cartItems);
        
        callback(cartItems);
      } else {
        console.log('Cart does not exist, initializing...');
        // If cart doesn't exist, try to initialize
        this.initializeCart().then(() => {
          callback([]);
        });
      }
    }, (error) => {
      console.error('Error listening to cart changes:', error);
      // When error occurs, try to recover from local backup
      const backup = this.getLocalBackup();
      if (backup) {
        console.log('Using local backup due to Firebase error');
        callback(backup);
      } else {
        callback([]);
      }
    });
  }

  /**
   * Add item to cart (supports concurrent operations)
   * @param {Object} item - Item object
   */
  async addItem(item) {
    await this.ensureInitialized();
    
    try {
      const result = await runTransaction(db, async (transaction) => {
        const cartDoc = await transaction.get(this.cartRef);
        
        if (!cartDoc.exists()) {
          throw new Error('Cart does not exist');
        }
        
        const cartData = cartDoc.data();
        const cartItems = cartData.cartItems || [];
        
        // Add user info and timestamp to item
        const itemWithMeta = {
          ...item,
          addedBy: this.userId,
          addedAt: Date.now(),
          // Generate unique item instance ID, even for same items
          instanceId: `${item.id}_${item.count}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        // Add new item to beginning of array (newest first)
        const updatedCartItems = [itemWithMeta, ...cartItems];
        
        // Update cart
        transaction.update(this.cartRef, {
          cartItems: updatedCartItems,
          lastUpdated: serverTimestamp(),
          version: (cartData.version || 0) + 1,
          [`users.${this.userId}.lastActive`]: serverTimestamp()
        });
        
        console.log('Item added to shared cart:', {
          itemId: item.id,
          itemName: item.name,
          instanceId: itemWithMeta.instanceId,
          userId: this.userId
        });
        return itemWithMeta.instanceId;
      });
      return result;
    } catch (error) {
      console.error('Error adding item to shared cart:', error);
      // Add to local backup as fallback
      this.addToLocalBackup(item);
      throw error;
    }
  }

  /**
   * Update item quantity
   * @param {string} instanceId - Item instance ID  
   * @param {number} newQuantity - New quantity
   */
  async updateItemQuantity(instanceId, newQuantity, clientSeq) {
    await this.ensureInitialized();
    
    try {
      await runTransaction(db, async (transaction) => {
        const cartDoc = await transaction.get(this.cartRef);
        
        if (!cartDoc.exists()) {
          throw new Error('Cart does not exist');
        }
        
        const cartData = cartDoc.data();
        const cartItems = cartData.cartItems || [];
        
        // Find item to update
        const updatedCartItems = cartItems.map(item => {
          if (item.instanceId === instanceId) {
            const updatedItem = {
              ...item,
              quantity: Math.max(newQuantity, 1), // Minimum quantity is 1
              lastModifiedBy: this.userId,
              lastModifiedAt: Date.now(),
              lastClientSeq: typeof clientSeq === 'number' ? clientSeq : (this.clientSeq++),
            };
            
            // Recalculate total price
            if (item.subtotal && item.quantity > 0) {
              const unitPrice = parseFloat(item.subtotal);
              updatedItem.itemTotalPrice = Math.round(unitPrice * updatedItem.quantity * 100) / 100;
            }
            
            return updatedItem;
          }
          return item;
        });
        
        transaction.update(this.cartRef, {
          cartItems: updatedCartItems,
          lastUpdated: serverTimestamp(),
          version: (cartData.version || 0) + 1,
          [`users.${this.userId}.lastActive`]: serverTimestamp()
        });
        
        console.log('Item quantity updated:', { instanceId, newQuantity, userId: this.userId, clientSeq });
      });
    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw error;
    }
  }

  /**
   * Fast path: non-transactional quantity update (single read + write)
   * Lower latency vs transaction; acceptable with client-side debounce
   */
  async updateItemQuantityFast(instanceId, newQuantity, clientSeq) {
    await this.ensureInitialized();
    const cartDoc = await getDoc(this.cartRef);
    if (!cartDoc.exists()) throw new Error('Cart does not exist');
    const cartData = cartDoc.data();
    const cartItems = cartData.cartItems || [];

    const updatedCartItems = cartItems.map(item => {
      if (item.instanceId === instanceId) {
        const updatedItem = {
          ...item,
          quantity: Math.max(newQuantity, 1),
          lastModifiedBy: this.userId,
          lastModifiedAt: Date.now(),
          lastClientSeq: typeof clientSeq === 'number' ? clientSeq : (this.clientSeq++),
        };
        if (item.subtotal && item.quantity > 0) {
          const unitPrice = parseFloat(item.subtotal);
          updatedItem.itemTotalPrice = Math.round(unitPrice * updatedItem.quantity * 100) / 100;
        }
        return updatedItem;
      }
      return item;
    });

    await updateDoc(this.cartRef, {
      cartItems: updatedCartItems,
      lastUpdated: serverTimestamp(),
      version: (cartData.version || 0) + 1,
      [`users.${this.userId}.lastActive`]: serverTimestamp()
    });

    console.log('Fast quantity updated:', { instanceId, newQuantity, userId: this.userId, clientSeq });
  }

  /**
   * Remove item
   * @param {string} instanceId - Item instance ID
   */
  async removeItem(instanceId) {
    await this.ensureInitialized();
    
    try {
      await runTransaction(db, async (transaction) => {
        const cartDoc = await transaction.get(this.cartRef);
        
        if (!cartDoc.exists()) {
          throw new Error('Cart does not exist');
        }
        
        const cartData = cartDoc.data();
        const cartItems = cartData.cartItems || [];
        
        // Filter out the item to be removed
        const updatedCartItems = cartItems.filter(item => item.instanceId !== instanceId);
        
        transaction.update(this.cartRef, {
          cartItems: updatedCartItems,
          lastUpdated: serverTimestamp(),
          version: (cartData.version || 0) + 1,
          [`users.${this.userId}.lastActive`]: serverTimestamp()
        });
        
        console.log('Item removed from shared cart:', { instanceId, userId: this.userId });
      });
    } catch (error) {
      console.error('Error removing item from shared cart:', error);
      throw error;
    }
  }

  /**
   * Fast path: non-transactional remove (single read + write)
   */
  async removeItemFast(instanceId) {
    await this.ensureInitialized();
    const cartDoc = await getDoc(this.cartRef);
    if (!cartDoc.exists()) throw new Error('Cart does not exist');
    const cartData = cartDoc.data();
    const cartItems = cartData.cartItems || [];
    const updatedCartItems = cartItems.filter(item => item.instanceId !== instanceId);

    await updateDoc(this.cartRef, {
      cartItems: updatedCartItems,
      lastUpdated: serverTimestamp(),
      version: (cartData.version || 0) + 1,
      [`users.${this.userId}.lastActive`]: serverTimestamp()
    });

    console.log('Fast item removed:', { instanceId, userId: this.userId });
  }

  /**
   * Clear cart
   */
  async clearCart() {
    await this.ensureInitialized();
    
    try {
      await updateDoc(this.cartRef, {
        cartItems: [],
        lastUpdated: serverTimestamp(),
        version: serverTimestamp(), // Use timestamp as version number
        [`users.${this.userId}.lastActive`]: serverTimestamp()
      });
      
      console.log('Cart cleared by user:', this.userId);
      
      // Also clear local backup
      this.clearLocalBackup();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  /**
   * Get current active users
   */
  async getActiveUsers() {
    try {
      const cartDoc = await getDoc(this.cartRef);
      if (cartDoc.exists()) {
        const data = cartDoc.data();
        const users = data.users || {};
        
        // Filter active users (activity within 5 minutes)
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const activeUsers = Object.entries(users)
          .filter(([userId, userData]) => {
            const lastActive = userData.lastActive?.toMillis() || 0;
            return userData.isActive && lastActive > fiveMinutesAgo;
          })
          .map(([userId, userData]) => ({
            userId,
            ...userData,
            lastActive: userData.lastActive?.toMillis()
          }));
        
        return activeUsers;
      }
      return [];
    } catch (error) {
      console.error('Error getting active users:', error);
      return [];
    }
  }

  /**
   * User leaves (set to inactive status)
   */
  async leaveCart() {
    try {
      await updateDoc(this.cartRef, {
        [`users.${this.userId}.isActive`]: false,
        [`users.${this.userId}.leftAt`]: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      
      console.log('User left cart:', this.userId);
    } catch (error) {
      console.error('Error leaving cart:', error);
    }
  }

  /**
   * Ensure cart is initialized
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initializeCart();
    }
  }

  /**
   * Update local backup
   */
  updateLocalBackup(cartItems) {
    const backupKey = `shared-cart-backup-${this.cartId}`;
    try {
      localStorage.setItem(backupKey, JSON.stringify({
        cartItems,
        timestamp: Date.now(),
        userId: this.userId
      }));
    } catch (error) {
      console.warn('Failed to update local backup:', error);
    }
  }

  /**
   * Get local backup
   */
  getLocalBackup() {
    const backupKey = `shared-cart-backup-${this.cartId}`;
    try {
      const backup = localStorage.getItem(backupKey);
      if (backup) {
        const data = JSON.parse(backup);
        // Check if backup is too old (over 1 hour)
        if (Date.now() - data.timestamp < 60 * 60 * 1000) {
          return data.cartItems;
        }
      }
    } catch (error) {
      console.warn('Failed to get local backup:', error);
    }
    return null;
  }

  /**
   * Add to local backup (fallback solution)
   */
  addToLocalBackup(item) {
    const backup = this.getLocalBackup() || [];
    const itemWithMeta = {
      ...item,
      addedBy: this.userId,
      addedAt: Date.now(),
      instanceId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    backup.unshift(itemWithMeta);
    this.updateLocalBackup(backup);
  }

  /**
   * Clear local backup
   */
  clearLocalBackup() {
    const backupKey = `shared-cart-backup-${this.cartId}`;
    try {
      localStorage.removeItem(backupKey);
    } catch (error) {
      console.warn('Failed to clear local backup:', error);
    }
  }

  /**
   * Destroy instance
   */
  destroy() {
    this.leaveCart();
    console.log('SharedCartManager destroyed');
  }
}

export default SharedCartManager;
