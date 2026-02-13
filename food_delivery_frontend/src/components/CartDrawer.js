import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../state/AppContext";
import { mockRestaurants } from "../data/mockData";
import { money } from "./ui";

// PUBLIC_INTERFACE
export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const { cart, totals, setQty, clear } = useContext(AppContext);

  const restaurant = useMemo(() => {
    if (!cart.restaurantId) return null;
    return mockRestaurants.find((r) => r.id === cart.restaurantId) || { id: cart.restaurantId, name: "Restaurant", fee: 2.49 };
  }, [cart.restaurantId]);

  const fee = restaurant?.fee ?? 2.49;
  const total = totals.subtotal + (cart.items.length ? fee : 0);

  if (!open) return null;

  return (
    <div className="cartOverlay" role="dialog" aria-modal="true" aria-label="Cart">
      <div className="cartDrawer">
        <div className="cartHeader">
          <div>
            <strong>Cart</strong>
            <div className="smallNote">{restaurant ? restaurant.name : "No restaurant selected"}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btnGhost" onClick={() => { clear(); }}>Clear</button>
            <button className="btn" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="cartItems">
          {cart.items.length ? cart.items.map((x) => (
            <div className="cartItem" key={x.id}>
              <div className="menuThumb" aria-hidden="true" style={{ width: 38, height: 38, borderRadius: 12 }} />
              <div className="cartItemInfo">
                <p className="cartItemName">{x.name}</p>
                <p className="cartItemMeta">{money(x.price)} each</p>
              </div>
              <div className="qty" aria-label={`Quantity for ${x.name}`}>
                <button className="qtyBtn" onClick={() => setQty(x.id, x.qty - 1)} aria-label="Decrease quantity">−</button>
                <strong style={{ minWidth: 18, textAlign: "center" }}>{x.qty}</strong>
                <button className="qtyBtn" onClick={() => setQty(x.id, x.qty + 1)} aria-label="Increase quantity">+</button>
              </div>
            </div>
          )) : (
            <div className="panel">
              <p className="pageSub" style={{ margin: 0 }}>Your cart is empty.</p>
            </div>
          )}
        </div>

        <div className="cartFooter">
          <div className="rowBetween">
            <span className="smallNote">Subtotal</span>
            <strong>{money(totals.subtotal)}</strong>
          </div>
          <div className="rowBetween" style={{ marginTop: 6 }}>
            <span className="smallNote">Delivery</span>
            <strong>{cart.items.length ? money(fee) : money(0)}</strong>
          </div>
          <div className="hr" />
          <div className="rowBetween">
            <span className="smallNote">Total</span>
            <strong>{money(total)}</strong>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button className="btn btnGhost" onClick={() => { onClose(); navigate("/"); }}>Add more</button>
            <button
              className="btn btnAmber"
              disabled={!cart.items.length}
              onClick={() => {
                onClose();
                navigate("/checkout");
              }}
            >
              Checkout
            </button>
          </div>

          <p className="smallNote" style={{ marginTop: 10 }}>
            Note: cart is limited to one restaurant at a time.
          </p>
        </div>
      </div>
    </div>
  );
}
