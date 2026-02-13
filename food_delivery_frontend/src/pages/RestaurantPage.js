import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../state/AppContext";
import { mockMenusByRestaurantId, mockRestaurants } from "../data/mockData";
import { safeFetchJson } from "../services/api";
import { money, Toast } from "../components/ui";

function normalizeMenuItem(x) {
  return {
    id: String(x.id ?? x._id ?? x.menuItemId),
    name: x.name ?? x.title ?? "Item",
    desc: x.desc ?? x.description ?? "",
    price: Number(x.price ?? 0),
  };
}

function normalizeRestaurant(r) {
  return {
    id: String(r.id ?? r._id ?? r.restaurantId),
    name: r.name ?? r.title ?? "Restaurant",
    category: r.category ?? r.cuisine ?? "All",
    rating: Number(r.rating ?? 4.5),
    etaMinutes: Number(r.etaMinutes ?? r.eta ?? 25),
    fee: Number(r.fee ?? r.deliveryFee ?? 2.49),
    priceLevel: r.priceLevel ?? "$$",
    tags: r.tags ?? [],
  };
}

// PUBLIC_INTERFACE
export default function RestaurantPage() {
  const params = useParams();
  const navigate = useNavigate();
  const restaurantId = params.restaurantId;

  const { addItem } = useContext(AppContext);

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadRestaurantAndMenu() {
      const resR = await safeFetchJson(`/restaurants/${encodeURIComponent(restaurantId)}`, { method: "GET" });
      const resM = await safeFetchJson(`/restaurants/${encodeURIComponent(restaurantId)}/menu`, { method: "GET" });

      if (!alive) return;

      const fallbackRestaurant = mockRestaurants.find((r) => r.id === restaurantId) || normalizeRestaurant({ id: restaurantId, name: "Restaurant" });
      setRestaurant(resR.ok && resR.data ? normalizeRestaurant(resR.data) : fallbackRestaurant);

      if (resM.ok && Array.isArray(resM.data)) {
        setMenu(resM.data.map(normalizeMenuItem));
      } else {
        setMenu((mockMenusByRestaurantId[restaurantId] || []).map(normalizeMenuItem));
      }
    }

    loadRestaurantAndMenu();
    return () => {
      alive = false;
    };
  }, [restaurantId]);

  const headerMeta = useMemo(() => {
    if (!restaurant) return "";
    return `${restaurant.category} • ${restaurant.priceLevel} • ${restaurant.etaMinutes} min • Delivery ${money(restaurant.fee)}`;
  }, [restaurant]);

  if (!restaurant) {
    return (
      <div className="panel">
        <p className="pageSub">Loading menu…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="panel">
        <div className="menuHeader">
          <div>
            <h1 className="pageTitle" style={{ marginBottom: 6 }}>{restaurant.name}</h1>
            <p className="pageSub">{headerMeta}</p>
            <p className="smallNote">Rating {restaurant.rating.toFixed(1)} ★</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btnGhost" onClick={() => navigate("/")}>Back</button>
            <button className="btn btnAmber" onClick={() => navigate("/checkout")}>Go to checkout</button>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="sectionHeader">
          <div>
            <h2 className="pageTitle" style={{ fontSize: 18, margin: 0 }}>Menu</h2>
            <p className="pageSub" style={{ margin: "6px 0 0" }}>Add items to your cart.</p>
          </div>
          <span className="smallNote">{menu.length ? `${menu.length} items` : "No items available"}</span>
        </div>

        <div className="menuList">
          {menu.map((m) => (
            <div key={m.id} className="menuItem">
              <div className="menuThumb" aria-hidden="true" />
              <div>
                <p className="menuItemTitle">{m.name}</p>
                <p className="menuItemDesc">{m.desc || "A customer favorite."}</p>
              </div>
              <div className="menuItemActions">
                <span className="price">{money(m.price)}</span>
                <button
                  className="btn"
                  onClick={() => {
                    addItem(restaurant.id, { id: m.id, name: m.name, price: m.price });
                    setToast(`Added ${m.name}`);
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>

        {!menu.length ? (
          <div style={{ marginTop: 10 }}>
            <button
              className="btn btnGhost"
              onClick={() => navigate("/")}
            >
              Browse other restaurants
            </button>
          </div>
        ) : null}
      </div>

      <Toast message={toast} onDone={() => setToast("")} />
    </div>
  );
}
