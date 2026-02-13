import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categories, mockRestaurants } from "../data/mockData";
import { safeFetchJson } from "../services/api";

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
export default function HomePage({ searchQuery, onPickCategory, activeCategory }) {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState(mockRestaurants);
  const [dataNote, setDataNote] = useState("Mock data mode (no backend connection detected).");

  useEffect(() => {
    let alive = true;

    async function load() {
      const res = await safeFetchJson("/restaurants", { method: "GET" });
      if (!alive) return;

      if (res.ok && Array.isArray(res.data)) {
        setRestaurants(res.data.map(normalizeRestaurant));
        setDataNote("Live data connected.");
      } else {
        setRestaurants(mockRestaurants);
        setDataNote("Mock data mode (no backend connection detected).");
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    return restaurants.filter((r) => {
      const matchesCategory = activeCategory === "All" ? true : r.category === activeCategory;
      const matchesQuery = !q ? true : (r.name || "").toLowerCase().includes(q) || (r.tags || []).join(" ").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, restaurants, searchQuery]);

  return (
    <div>
      <div className="menuHeader">
        <div>
          <h1 className="pageTitle">Restaurants</h1>
          <p className="pageSub">Browse top picks, add items to cart, and track delivery in real time.</p>
          <p className="smallNote">{dataNote}</p>
        </div>
        <button className="btn btnGhost" onClick={() => onPickCategory("All")}>Clear filters</button>
      </div>

      <div className="sidebar" style={{ marginTop: 14, display: "none" }} />

      <div className="cardGrid" aria-label="Restaurant list">
        {filtered.map((r) => (
          <article key={r.id} className="card" role="button" tabIndex={0} onClick={() => navigate(`/restaurants/${encodeURIComponent(r.id)}`)}
            onKeyDown={(e) => (e.key === "Enter" ? navigate(`/restaurants/${encodeURIComponent(r.id)}`) : null)}
            aria-label={`Open ${r.name}`}>
            <div className="cardMedia" />
            <div className="cardBody">
              <div className="cardTitleRow">
                <h3 className="cardTitle">{r.name}</h3>
                <span className="chip" title="Rating">{r.rating.toFixed(1)} ★</span>
              </div>
              <p className="cardMeta">
                {r.category} • {r.priceLevel} • {r.etaMinutes} min • Delivery {r.fee.toFixed(2)}
              </p>
              {r.tags?.length ? (
                <p className="cardMeta" style={{ marginTop: 8 }}>
                  {r.tags.slice(0, 3).map((t) => (
                    <span key={t} className="chip" style={{ marginRight: 8 }}>{t}</span>
                  ))}
                </p>
              ) : null}
            </div>
            <div className="cardFooter">
              <span className="chip">Fast pickup</span>
              <button className="btn btnAmber" onClick={(e) => { e.stopPropagation(); navigate(`/restaurants/${encodeURIComponent(r.id)}`); }}>
                View menu
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="sectionHeader">
          <div>
            <h2 className="pageTitle" style={{ fontSize: 18, margin: 0 }}>Categories</h2>
            <p className="pageSub" style={{ margin: "6px 0 0" }}>Quick filters</p>
          </div>
          <span className="smallNote">Tip: categories also appear in the left sidebar on desktop</span>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {categories.map((c) => (
            <button
              key={c}
              className={`pill ${c === activeCategory ? "pillPrimary" : ""}`}
              onClick={() => onPickCategory(c)}
              aria-pressed={c === activeCategory}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
