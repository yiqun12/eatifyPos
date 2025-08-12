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
  // Debounce timers per item instance for coalescing rapid clicks
  const pendingTimersRef = useRef({}); // legacy debounce timers per instance (unused after throttle)
  const throttleTimersRef = useRef({}); // { [instanceId]: number }
  const lastDesiredQtyRef = useRef({}); // { [instanceId]: number }
  // Track desired local quantities to avoid snapshot overriding immediate UI
  const pendingDesiredRef = useRef({}); // { [instanceId]: { qty:number, ts:number } }
  // Track items pending local deletion to suppress snapshot resurrection
  const pendingDeleteRef = useRef({}); // { [instanceId]: number }
  const RECONCILE_GRACE_MS = 1000; // during this window prefer local desired

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
          // Reconcile snapshot with recent local desires to avoid "被覆盖" 的观感
          setProducts(() => {
            const merged = cartItems
              // Suppress items that we just deleted locally within grace window
              .filter((snapItem) => {
                const delTs = pendingDeleteRef.current[snapItem.instanceId];
                if (delTs && (Date.now() - delTs) < RECONCILE_GRACE_MS) {
                  return false; // keep hidden
                }
                // If server still has it after grace, clear flag
                if (delTs && (Date.now() - delTs) >= RECONCILE_GRACE_MS) {
                  delete pendingDeleteRef.current[snapItem.instanceId];
                }
                return true;
              })
              .map((snapItem) => {
              const pending = pendingDesiredRef.current[snapItem.instanceId];
              if (pending && (Date.now() - pending.ts) < RECONCILE_GRACE_MS) {
                const unit = (Number(snapItem.itemTotalPrice || 0) / Math.max(1, Number(snapItem.quantity) || 1)) || 0;
                const qty = Math.max(1, Math.min(99, Number(pending.qty) || 1));
                const total = Math.round(unit * qty * 100) / 100;
                return { ...snapItem, quantity: qty, itemTotalPrice: total };
              }
              // 清理已达成的一致
              if (pending && Number(pending.qty) === Number(snapItem.quantity)) {
                delete pendingDesiredRef.current[snapItem.instanceId];
              }
              return snapItem;
            });
            setLoading(false);
            return merged;
          });
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
      const currentItems = JSON.parse(sessionStorage.getItem(store) || '[]');
      const newItems = [item, ...currentItems];
      sessionStorage.setItem(store, JSON.stringify(newItems));
      setProducts(newItems);
      return;
    }

    // Optimistic add: create a provisional instanceId to merge with snapshot
    const provisionalId = `prov_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const optimisticItem = { ...item, instanceId: provisionalId };
    pendingDesiredRef.current[provisionalId] = { qty: item.quantity || 1, ts: Date.now() };
    setProducts(prev => [optimisticItem, ...prev]);

    try {
      const realInstanceId = await cartManagerRef.current.addItem(item);
      // Replace provisional itemId with real instanceId
      setProducts(prev => prev.map(p => p.instanceId === provisionalId ? { ...p, instanceId: realInstanceId } : p));
      // Bridge desired for the new real id for a short window to avoid flicker
      pendingDesiredRef.current[realInstanceId] = { qty: item.quantity || 1, ts: Date.now() };
      delete pendingDesiredRef.current[provisionalId];
    } catch (err) {
      console.error('Failed to add item:', err);
      // Revert optimistic add on failure
      setProducts(prev => prev.filter(p => p.instanceId !== provisionalId));
      throw err;
    }
  }, [store]);

  // Helper: optimistic local update (proportional total price)
  const optimisticLocalUpdate = useCallback((instanceId, newQuantity) => {
    const clamped = Math.max(1, Math.min(99, Number(newQuantity) || 1));
    const now = Date.now();
    pendingDesiredRef.current[instanceId] = { qty: clamped, ts: now };
    setProducts(prev => prev.map(item => {
      if (item.instanceId !== instanceId) return item;
      const baseQty = Math.max(1, Number(item.quantity) || 1);
      const unit = Number(item.itemTotalPrice || 0) / baseQty;
      const total = Math.round(unit * clamped * 100) / 100;
      return { ...item, quantity: clamped, itemTotalPrice: total };
    }));
  }, []);

  // Helper: schedule throttled remote write (send latest at most every 120ms)
  const scheduleRemotePersist = useCallback((instanceId, qty) => {
    lastDesiredQtyRef.current[instanceId] = qty;
    if (throttleTimersRef.current[instanceId]) {
      // already scheduled; just update desired qty
      return;
    }
    throttleTimersRef.current[instanceId] = setTimeout(async () => {
      const targetQty = lastDesiredQtyRef.current[instanceId];
      delete throttleTimersRef.current[instanceId];
      if (!cartManagerRef.current) return;
      try {
        if (cartManagerRef.current.updateItemQuantityFast) {
          await cartManagerRef.current.updateItemQuantityFast(instanceId, targetQty, Date.now());
        } else {
          await cartManagerRef.current.updateItemQuantity(instanceId, targetQty, Date.now());
        }
      } catch (err) {
        console.error('Failed to persist quantity:', err);
      }
    }, 120);
  }, []);

  // Update item quantity (optimistic + debounced persist)
  const updateQuantity = useCallback(async (instanceId, newQuantity) => {
    if (!cartManagerRef.current) {
      console.warn('Cart manager not initialized');
      return;
    }
    const clamped = Math.max(1, Math.min(99, Number(newQuantity) || 1));
    optimisticLocalUpdate(instanceId, clamped);
    scheduleRemotePersist(instanceId, clamped);
  }, [optimisticLocalUpdate, scheduleRemotePersist]);

  // Remove item
  const removeItem = useCallback(async (instanceId) => {
    if (!cartManagerRef.current) {
      console.warn('Cart manager not initialized');
      return;
    }

    // Optimistic local delete: update UI immediately
    if (pendingTimersRef.current[instanceId]) {
      clearTimeout(pendingTimersRef.current[instanceId]);
      delete pendingTimersRef.current[instanceId];
    }
    delete pendingDesiredRef.current[instanceId];
    setProducts(prev => prev.filter(item => item.instanceId !== instanceId));

    try {
      if (cartManagerRef.current.removeItemFast) {
        await cartManagerRef.current.removeItemFast(instanceId);
      } else {
        await cartManagerRef.current.removeItem(instanceId);
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
      // 失败由后续 snapshot 校正；这里不阻塞 UI
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
      const nextQuantity = (item.quantity || 1) - 1;
      if (nextQuantity >= 1) {
        updateQuantity(item.instanceId, nextQuantity);
      } else {
        // If quantity would go below 1, remove this instance instead
        if (pendingTimersRef.current[item.instanceId]) {
          clearTimeout(pendingTimersRef.current[item.instanceId]);
          delete pendingTimersRef.current[item.instanceId];
        }
        delete pendingDesiredRef.current[item.instanceId];
        // mark local delete to suppress snapshot resurrection for a short window
        pendingDeleteRef.current[item.instanceId] = Date.now();
        removeItem(item.instanceId);
      }
    }
  }, [products, updateQuantity, removeItem]);

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
