import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../state/AppContext";
import { Toast } from "../components/ui";

// PUBLIC_INTERFACE
export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, setProfile } = useContext(AppContext);
  const [toast, setToast] = useState("");

  return (
    <div>
      <div className="menuHeader">
        <div>
          <h1 className="pageTitle">Profile</h1>
          <p className="pageSub">Saved locally for this device.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btnGhost" onClick={() => navigate(-1)}>Back</button>
          <button className="btn btnAmber" onClick={() => navigate("/checkout")}>Checkout</button>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="sectionHeader">
          <div>
            <h2 className="pageTitle" style={{ fontSize: 18, margin: 0 }}>Contact</h2>
            <p className="pageSub" style={{ margin: "6px 0 0" }}>Used for delivery handoff.</p>
          </div>
          <span className="smallNote">Auto-saved</span>
        </div>

        <div className="formGrid">
          <div className="field">
            <label htmlFor="p_name">Name</label>
            <input
              id="p_name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="p_phone">Phone</label>
            <input
              id="p_phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="p_address1">Address</label>
            <input
              id="p_address1"
              value={profile.address1}
              onChange={(e) => setProfile({ ...profile, address1: e.target.value })}
              placeholder="Street, apt, etc."
            />
          </div>
          <div className="field">
            <label htmlFor="p_city">City</label>
            <input
              id="p_city"
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="p_payment">Default payment</label>
            <select
              id="p_payment"
              value={profile.payment}
              onChange={(e) => setProfile({ ...profile, payment: e.target.value })}
            >
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="apple_pay">Apple Pay</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            className="btn"
            onClick={() => {
              setToast("Profile saved.");
            }}
          >
            Done
          </button>
        </div>
      </div>

      <Toast message={toast} onDone={() => setToast("")} />
    </div>
  );
}
