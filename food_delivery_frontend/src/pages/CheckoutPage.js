import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../state/AppContext";
import { mockRestaurants } from "../data/mockData";
import { money, Panel, Toast } from "../components/ui";

// PUBLIC_INTERFACE
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, totals, profile, setProfile, startCheckout } = useContext(AppContext);

  const [toast, setToast] = useState("");

  const restaurant = useMemo(() => {
    if (!cart.restaurantId) return null;
    return mockRestaurants.find((r) => r.id === cart.restaurantId) || { id: cart.restaurantId, name: "Restaurant", fee: 2.49, etaMinutes: 25 };
  }, [cart.restaurantId]);

  const fee = restaurant?.fee ?? 2.49;
  const total = totals.subtotal + fee;

  const canPlace = cart.items.length > 0 && profile.name.trim() && profile.address1.trim() && profile.city.trim();

  return (
    <div>
      <div className="menuHeader">
        <div>
          <h1 className="pageTitle">Checkout</h1>
          <p className="pageSub">Review your order and delivery details.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btnGhost" onClick={() => navigate(-1)}>Back</button>
          <button className="btn btnAmber" onClick={() => navigate("/")}>Browse</button>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="sectionHeader">
          <div>
            <h2 className="pageTitle" style={{ fontSize: 18, margin: 0 }}>Order summary</h2>
            <p className="pageSub" style={{ margin: "6px 0 0" }}>{restaurant ? restaurant.name : "No restaurant selected"}</p>
          </div>
          <span className="smallNote">{cart.items.length ? `${totals.itemCount} items` : "Cart empty"}</span>
        </div>

        {cart.items.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cart.items.map((x) => (
              <div key={x.id} className="rowBetween">
                <div>
                  <strong>{x.name}</strong>
                  <div className="smallNote">Qty {x.qty}</div>
                </div>
                <div><strong>{money(x.qty * x.price)}</strong></div>
              </div>
            ))}
            <div className="hr" />
            <div className="rowBetween">
              <span className="smallNote">Subtotal</span>
              <strong>{money(totals.subtotal)}</strong>
            </div>
            <div className="rowBetween">
              <span className="smallNote">Delivery fee</span>
              <strong>{money(fee)}</strong>
            </div>
            <div className="rowBetween">
              <span className="smallNote">Total</span>
              <strong>{money(total)}</strong>
            </div>
          </div>
        ) : (
          <p className="pageSub">Your cart is empty. Add some items first.</p>
        )}
      </div>

      <Panel
        title="Delivery details"
        subtitle="This is stored locally (no login required)."
        right={<span className="smallNote">Required fields marked *</span>}
      >
        <div className="formGrid">
          <div className="field">
            <label htmlFor="name">Name *</label>
            <input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="Optional" />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="address1">Address *</label>
            <input id="address1" value={profile.address1} onChange={(e) => setProfile({ ...profile, address1: e.target.value })} placeholder="Street, apt, etc." />
          </div>
          <div className="field">
            <label htmlFor="city">City *</label>
            <input id="city" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="payment">Payment</label>
            <select id="payment" value={profile.payment} onChange={(e) => setProfile({ ...profile, payment: e.target.value })}>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="apple_pay">Apple Pay</option>
            </select>
          </div>
        </div>
      </Panel>

      <div className="panel">
        <div className="rowBetween">
          <div>
            <strong>Ready to place the order?</strong>
            <div className="smallNote">You’ll be redirected to tracking.</div>
          </div>
          <button
            className="btn btnAmber"
            disabled={!canPlace}
            onClick={async () => {
              if (!restaurant) {
                setToast("Choose a restaurant first.");
                return;
              }
              const order = await startCheckout({ restaurant, fee });
              setToast(`Order placed: ${order.id}`);
              setTimeout(() => navigate("/tracking"), 350);
            }}
          >
            Place order
          </button>
        </div>

        {!canPlace ? <p className="smallNote" style={{ marginTop: 10 }}>Add items + fill Name, Address, City to place the order.</p> : null}
      </div>

      <Toast message={toast} onDone={() => setToast("")} />
    </div>
  );
}
