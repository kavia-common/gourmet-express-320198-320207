/**
 * Cart state utilities + persistence.
 */

const STORAGE_KEY = "gourmet_express_cart_v1";

/**
 * PUBLIC_INTERFACE
 * Load cart from localStorage.
 * @returns {{items: Array<{id:string,name:string,price:number,qty:number,restaurantId:string}>, restaurantId: string|null}}
 */
export function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], restaurantId: null };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return { items: [], restaurantId: null };
    return {
      items: parsed.items,
      restaurantId: parsed.restaurantId || null,
    };
  } catch {
    return { items: [], restaurantId: null };
  }
}

/**
 * PUBLIC_INTERFACE
 * Persist cart to localStorage.
 * @param {{items: Array, restaurantId: string|null}} cart
 */
export function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

/**
 * PUBLIC_INTERFACE
 * Add an item; enforces single-restaurant cart (common delivery pattern).
 * @param {{items:Array, restaurantId: string|null}} cart
 * @param {{id:string,name:string,price:number}} item
 * @param {string} restaurantId
 * @returns {{items:Array, restaurantId: string|null}}
 */
export function addToCart(cart, item, restaurantId) {
  if (cart.restaurantId && cart.restaurantId !== restaurantId) {
    // Reset cart if adding from a different restaurant (simple UX).
    cart = { items: [], restaurantId: null };
  }

  const idx = cart.items.findIndex((x) => x.id === item.id);
  if (idx >= 0) {
    const next = [...cart.items];
    next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
    return { items: next, restaurantId };
  }
  return {
    items: [...cart.items, { ...item, qty: 1, restaurantId }],
    restaurantId,
  };
}

/**
 * PUBLIC_INTERFACE
 * Update quantity. Qty <= 0 removes the item.
 * @param {{items:Array, restaurantId: string|null}} cart
 * @param {string} itemId
 * @param {number} qty
 * @returns {{items:Array, restaurantId: string|null}}
 */
export function setQty(cart, itemId, qty) {
  const nextItems = cart.items
    .map((x) => (x.id === itemId ? { ...x, qty } : x))
    .filter((x) => x.qty > 0);

  return { items: nextItems, restaurantId: nextItems.length ? cart.restaurantId : null };
}

/**
 * PUBLIC_INTERFACE
 * Clear cart.
 * @returns {{items:Array, restaurantId:null}}
 */
export function clearCart() {
  return { items: [], restaurantId: null };
}

/**
 * PUBLIC_INTERFACE
 * Compute totals.
 * @param {{items:Array<{price:number,qty:number}>}} cart
 * @returns {{itemCount:number, subtotal:number}}
 */
export function cartTotals(cart) {
  const itemCount = cart.items.reduce((acc, x) => acc + x.qty, 0);
  const subtotal = cart.items.reduce((acc, x) => acc + x.qty * x.price, 0);
  return { itemCount, subtotal };
}
