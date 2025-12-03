import { useCallback } from 'react';
import useSharedCart from './useSharedCart';

/**
 * Food Cart Hook - Handles adding food items to cart
 * Automatically detects if shared cart should be used based on URL parameters
 */
function useFoodCart() {
  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const store = params.get('store') ? params.get('store').toLowerCase() : "";
  const table = params.get('table') ? params.get('table') : "";
  
  // Check if this is a customer scan-to-order scenario
  const isCustomerScanOrder = store && table && store.trim() !== '' && table.trim() !== '';
  
  // Use shared cart for customer scan-to-order scenarios
  const sharedCart = useSharedCart(isCustomerScanOrder ? store : null, isCustomerScanOrder ? table : null);

  /**
   * Add food item to cart (universal function that works with both shared cart and sessionStorage)
   * @param {string} id - Food item ID
   * @param {string} name - Food item name
   * @param {number} subtotal - Food item price
   * @param {string} image - Food item image URL
   * @param {Object} attributeSelected - Selected attributes/options
   * @param {number} count - Item count/variant identifier
   * @param {string} CHI - Chinese name (optional)
   */
  const addFoodItem = useCallback(async (id, name, subtotal, image, attributeSelected, count, CHI) => {
    const itemData = {
      id,
      name,
      subtotal: parseFloat(subtotal),
      image,
      quantity: 1,
      attributeSelected,
      count,
      itemTotalPrice: parseFloat(subtotal),
      CHI,
      addedAt: Date.now()
    };

    if (isCustomerScanOrder && sharedCart.isSharedCart && !sharedCart.loading) {
      // Use shared cart for customer scan-to-order
      try {
        await sharedCart.addItem(itemData);
        console.log('Item added to shared cart:', { id, name, store, table });
        return true;
      } catch (error) {
        console.error('Failed to add item to shared cart:', error);
        // Fallback to sessionStorage
        addToSessionStorage(itemData);
        return false;
      }
    } else {
      // Use sessionStorage for other scenarios (admin, regular ordering, etc.)
      addToSessionStorage(itemData);
      return true;
    }
  }, [store, table, isCustomerScanOrder, sharedCart]);

  /**
   * Fallback function to add item to sessionStorage (original logic)
   */
  const addToSessionStorage = useCallback((itemData) => {
    const { id, name, subtotal, image, attributeSelected, count, CHI } = itemData;
    
    // Check if the array exists in session storage
    if (sessionStorage.getItem(store) === null) {
      sessionStorage.setItem(store, JSON.stringify([]));
    }

    // Retrieve the array from session storage
    let products = JSON.parse(sessionStorage.getItem(store)) || [];
    
    // Find existing product with matching id and count
    const existingProduct = products.find((product) => product.id === id && product.count === count);
    
    if (existingProduct) {
      // Update existing product
      existingProduct.name = name;
      existingProduct.subtotal = subtotal;
      existingProduct.image = image;
      existingProduct.quantity++;
      existingProduct.attributeSelected = attributeSelected;
      existingProduct.count = count;
      existingProduct.itemTotalPrice = Math.round(100 * (subtotal * existingProduct.quantity)) / 100;
      existingProduct.CHI = CHI;
    } else {
      // Add new product to the beginning of array
      products.unshift({
        id,
        name,
        subtotal: parseFloat(subtotal),
        image,
        quantity: 1,
        attributeSelected,
        count,
        itemTotalPrice: parseFloat(subtotal),
        CHI
      });
    }

    // Update sessionStorage
    sessionStorage.setItem(store, JSON.stringify(products));
    
    // Update cart badge if element exists
    try {
      const total = products.reduce((acc, product) => acc + (product.quantity), 0);
      const cartElement = document.getElementById('cart');
      if (cartElement) {
        cartElement.setAttribute("data-totalitems", total);
      }
    } catch (error) {
      console.warn('Failed to update cart badge:', error);
    }
    
    console.log('Item added to sessionStorage:', { id, name, store });
  }, [store]);

  /**
   * Remove food item from cart
   * @param {string} id - Food item ID
   * @param {number} count - Item count/variant identifier
   * @param {Object} attributeSelected - Selected attributes (for identification)
   */
  const removeFoodItem = useCallback(async (id, count, attributeSelected) => {
    if (isCustomerScanOrder && sharedCart.isSharedCart && !sharedCart.loading) {
      // Use shared cart for customer scan-to-order
      try {
        // Find the item in shared cart products
        const item = sharedCart.products.find(p => 
          p.id === id && 
          p.count === count && 
          JSON.stringify(p.attributeSelected) === JSON.stringify(attributeSelected)
        );
        
        if (item && item.instanceId) {
          await sharedCart.removeItem(item.instanceId);
          console.log('Item removed from shared cart:', { id, count });
          return true;
        }
      } catch (error) {
        console.error('Failed to remove item from shared cart:', error);
      }
    } else {
      // Use sessionStorage for other scenarios
      try {
        let products = JSON.parse(sessionStorage.getItem(store)) || [];
        products = products.filter((product) => !(
          product.id === id && 
          product.count === count && 
          JSON.stringify(product.attributeSelected) === JSON.stringify(attributeSelected)
        ));
        sessionStorage.setItem(store, JSON.stringify(products));
        
        // Update cart badge
        const total = products.reduce((acc, product) => acc + (product.quantity), 0);
        const cartElement = document.getElementById('cart');
        if (cartElement) {
          cartElement.setAttribute("data-totalitems", total);
        }
        
        console.log('Item removed from sessionStorage:', { id, count });
        return true;
      } catch (error) {
        console.error('Failed to remove item from sessionStorage:', error);
      }
    }
    return false;
  }, [store, isCustomerScanOrder, sharedCart]);

  return {
    // Main functions
    addFoodItem,
    removeFoodItem,
    
    // State information
    isSharedCart: isCustomerScanOrder && sharedCart.isSharedCart,
    isLoading: sharedCart.loading,
    isOnline: sharedCart.isOnline,
    activeUsers: sharedCart.activeUsers,
    
    // Store/table info
    store,
    table,
    isCustomerScanOrder,
    
    // Shared cart instance (for advanced operations)
    sharedCart: sharedCart.cartManager
  };
}

export default useFoodCart;
