import React, { createContext, useEffect, useMemo, useState } from "react";
import { safeFetchJson } from "../services/api";
import { cartTotals, clearCart, loadCart, saveCart, addToCart, setQty } from "./cart";
import { createMockOrder, getMockTrackingSteps } from "../data/mockData";

/**
 * PUBLIC_INTERFACE
 * App-level context:
 * - cart persistence
 * - profile (local)
 * - active order + tracking (API with fallback mock simulation)
 */
export const AppContext = createContext(null);

function loadProfile() {
  try {
    const raw = localStorage.getItem("gourmet_express_profile_v1");
    if (!raw) return { name: "Alex", phone: "", address1: "", city: "", payment: "card" };
    const p = JSON.parse(raw);
    return { name: p.name || "Alex", phone: p.phone || "", address1: p.address1 || "", city: p.city || "", payment: p.payment || "card" };
  } catch {
    return { name: "Alex", phone: "", address1: "", city: "", payment: "card" };
  }
}

function saveProfile(profile) {
  localStorage.setItem("gourmet_express_profile_v1", JSON.stringify(profile));
}

// PUBLIC_INTERFACE
export function AppProvider({ children }) {
  const [cart, setCartState] = useState(() => loadCart());
  const [profile, setProfile] = useState(() => loadProfile());
  const [activeOrder, setActiveOrder] = useState(null);
  const [tracking, setTracking] = useState({ mode: "none", steps: [] });

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  const totals = useMemo(() => cartTotals(cart), [cart]);

  // Cart actions
  const actions = useMemo(() => {
    return {
      addItem: (restaurantId, item) => setCartState((c) => addToCart(c, item, restaurantId)),
      setQty: (itemId, qty) => setCartState((c) => setQty(c, itemId, qty)),
      clear: () => setCartState(clearCart()),
      setProfile: (nextProfile) => setProfile(nextProfile),
      startCheckout: async ({ restaurant, fee }) => {
        // Attempt backend order creation (if available), else fallback to mock.
        const address = { address1: profile.address1, city: profile.city, phone: profile.phone, name: profile.name };
        const payload = {
          restaurantId: restaurant.id,
          items: cart.items.map((x) => ({ id: x.id, name: x.name, qty: x.qty, price: x.price })),
          deliveryFee: fee,
          address,
          paymentMethod: profile.payment,
        };

        const apiRes = await safeFetchJson("/orders", { method: "POST", body: JSON.stringify(payload) });
        const order =
          apiRes.ok && apiRes.data
            ? {
                id: apiRes.data.id || apiRes.data.orderId || apiRes.data._id || `ord_${Date.now()}`,
                createdAt: apiRes.data.createdAt || new Date().toISOString(),
                restaurant,
                fee,
              }
            : createMockOrder({ items: cart.items, restaurant, address });

        setActiveOrder(order);
        setCartState(clearCart());

        // Start tracking: try websocket or polling endpoints if provided, otherwise simulate.
        setTracking({ mode: apiRes.ok ? "api" : "mock", steps: getMockTrackingSteps(0), startedAt: Date.now() });
        return order;
      },
      refreshTracking: async () => {
        if (!activeOrder) return;

        // If API exists, attempt /orders/:id/tracking
        const apiRes = await safeFetchJson(`/orders/${encodeURIComponent(activeOrder.id)}/tracking`, { method: "GET" });
        if (apiRes.ok && apiRes.data) {
          const steps = Array.isArray(apiRes.data.steps)
            ? apiRes.data.steps.map((s) => ({
                key: s.key || s.status || "step",
                title: s.title || s.label || s.status || "Update",
                meta: s.meta || s.message || "",
                active: !!s.active,
              }))
            : getMockTrackingSteps(0);

          setTracking((t) => ({ ...t, mode: "api", steps }));
          return;
        }

        // Mock simulation
        setTracking((t) => {
          const startedAt = t.startedAt || Date.now();
          const elapsedMinutes = Math.max(0, Math.floor((Date.now() - startedAt) / 60000));
          return { ...t, mode: "mock", steps: getMockTrackingSteps(elapsedMinutes), startedAt };
        });
      },
      clearOrder: () => {
        setActiveOrder(null);
        setTracking({ mode: "none", steps: [] });
      },
    };
  }, [activeOrder, cart.items, profile]);

  const value = useMemo(
    () => ({
      cart,
      totals,
      profile,
      activeOrder,
      tracking,
      ...actions,
    }),
    [actions, activeOrder, cart, profile, totals, tracking]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
