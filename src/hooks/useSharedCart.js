import { useState, useEffect, useRef, useCallback } from 'react';
import SharedCartManager from '../utils/SharedCartManager';

/**
 * Shared Cart Hook - Specifically for customer scan-to-order scenarios
 * Provides Firebase real-time sync functionality with multi-user collaboration
 */
function useSharedCart(store, table) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const cartManagerRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Check if valid store and table parameters exist
  const isValidParams = store && table && store.trim() !== '' && table.trim() !== '';

  // Initialize cart manager
  useEffect(() => {
    if (!isValidParams) {
      console.log('Invalid store or table params, skipping shared cart initialization');
      setLoading(false);
      return;
    }

    console.log('Initializing shared cart for:', { store, table });
    
    const initCart = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Create cart manager
        const cartManager = new SharedCartManager(store, table);
        cartManagerRef.current = cartManager;
        
        // Initialize cart
        await cartManager.initializeCart();
        
        // Start listening to cart changes
        const unsubscribe = cartManager.listenToCart((cartItems) => {
          console.log('Cart items updated:', cartItems.length);
          setProducts(cartItems);
          setLoading(false);
        });
        
        unsubscribeRef.current = unsubscribe;
        
        // Regularly update active users list
        const updateActiveUsers = async () => {
          try {
            const users = await cartManager.getActiveUsers();
            setActiveUsers(users);
          } catch (err) {
            console.warn('Failed to update active users:', err);
          }
        };
        
        // Update immediately, then every 30 seconds
        updateActiveUsers();
        const userUpdateInterval = setInterval(updateActiveUsers, 30000);
        
        // Cleanup function
        return () => {
          clearInterval(userUpdateInterval);
          if (unsubscribeRef.current) {
            unsubscribeRef.current();
          }
        };
        
      } catch (err) {
        console.error('Failed to initialize shared cart:', err);
        setError(err.message);
        setLoading(false);
        
        // Fallback to local storage
        const fallbackItems = JSON.parse(sessionStorage.getItem(store) || '[]');
        setProducts(fallbackItems);
      }
    };

    const cleanup = initCart();
    
    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => cleanupFn && cleanupFn());
      }
    };
  }, [store, table, isValidParams]);

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (cartManagerRef.current) {
        cartManagerRef.current.destroy();
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Add item
  const addItem = useCallback(async (item) => {
    if (!cartManagerRef.current) {
      console.warn('Cart manager not initialized, falling back to sessionStorage');
      // Fallback to sessionStorage
      const currentItems = JSON.parse(sessionStorage.getItem(store) || '[]');
      const newItems = [item, ...currentItems];
      sessionStorage.setItem(store, JSON.stringify(newItems));
      setProducts(newItems);
      return;
    }

    try {
      await cartManagerRef.current.addItem(item);
    } catch (err) {
      console.error('Failed to add item:', err);
      // Fallback to local update
      setProducts(prev => [item, ...prev]);
      throw err;
    }
  }, [store]);

  // Update item quantity
  const updateQuantity = useCallback(async (instanceId, newQuantity) => {
    if (!cartManagerRef.current) {
      console.warn('Cart manager not initialized');
      return;
    }

    try {
      await cartManagerRef.current.updateItemQuantity(instanceId, newQuantity);
    } catch (err) {
      console.error('Failed to update quantity:', err);
      // Local update as fallback
      setProducts(prev => prev.map(item => 
        item.instanceId === instanceId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
      throw err;
    }
  }, []);

  // Remove item
  const removeItem = useCallback(async (instanceId) => {
    if (!cartManagerRef.current) {
      console.warn('Cart manager not initialized');
      return;
    }

    try {
      await cartManagerRef.current.removeItem(instanceId);
    } catch (err) {
      console.error('Failed to remove item:', err);
      // Local deletion as fallback
      setProducts(prev => prev.filter(item => item.instanceId !== instanceId));
      throw err;
    }
  }, []);

  // Clear cart
  const clearCart = useCallback(async () => {
    if (!cartManagerRef.current) {
      console.warn('Cart manager not initialized');
      setProducts([]);
      sessionStorage.removeItem(store);
      return;
    }

    try {
      await cartManagerRef.current.clearCart();
    } catch (err) {
      console.error('Failed to clear cart:', err);
      // Local clear as fallback
      setProducts([]);
      sessionStorage.removeItem(store);
      throw err;
    }
  }, [store]);

  // Compatible with existing handleDeleteClick function
  const handleDeleteClick = useCallback((productId, count) => {
    // Find corresponding item instance
    const item = products.find(p => p.id === productId && p.count === count);
    if (item && item.instanceId) {
      removeItem(item.instanceId);
    }
  }, [products, removeItem]);

  // Compatible with existing handlePlusClick function
  const handlePlusClick = useCallback((productId, targetCount) => {
    const item = products.find(p => p.id === productId && p.count === targetCount);
    if (item && item.instanceId) {
      const newQuantity = Math.min(item.quantity + 1, 99);
      updateQuantity(item.instanceId, newQuantity);
    }
  }, [products, updateQuantity]);

  // Compatible with existing handleMinusClick function
  const handleMinusClick = useCallback((productId, targetCount) => {
    const item = products.find(p => p.id === productId && p.count === targetCount);
    if (item && item.instanceId) {
      const newQuantity = Math.max(item.quantity - 1, 1);
      updateQuantity(item.instanceId, newQuantity);
    }
  }, [products, updateQuantity]);

  // Calculate total price
  const totalPrice = products.reduce((acc, item) => {
    const itemPrice = item && parseFloat(item.itemTotalPrice) ? parseFloat(item.itemTotalPrice) : 0;
    return parseFloat(acc) + itemPrice;
  }, 0);

  // Calculate total quantity
  const totalQuantity = products.reduce((acc, product) => acc + (product.quantity || 0), 0);

  return {
    // State
    products,
    loading,
    error,
    isOnline,
    activeUsers,
    totalPrice,
    totalQuantity,
    
    // Operation functions
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    
    // Functions compatible with existing components
    handleDeleteClick,
    handlePlusClick,
    handleMinusClick,
    
    // Manager instance (for advanced operations)
    cartManager: cartManagerRef.current,
    
    // Whether to use shared cart (depends on valid parameters)
    isSharedCart: isValidParams
  };
}

export default useSharedCart;
