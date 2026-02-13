import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import RestaurantPage from "./pages/RestaurantPage";
import CheckoutPage from "./pages/CheckoutPage";
import TrackingPage from "./pages/TrackingPage";
import ProfilePage from "./pages/ProfilePage";
import CartDrawer from "./components/CartDrawer";
import { categories } from "./data/mockData";

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState("light");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    // Close cart drawer on route change for clean navigation.
    setCartOpen(false);
  }, [location.pathname]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const sidebarVisible = useMemo(() => location.pathname === "/", [location.pathname]);

  return (
    <div>
      <header className="topNav">
        <div className="container topNavInner">
          <div className="brand" aria-label="Gourmet Express">
            <div className="brandMark" aria-hidden="true" />
            Gourmet Express
          </div>

          <nav className="navLinks" aria-label="Primary">
            <NavLink to="/" className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}>Browse</NavLink>
            <NavLink to="/tracking" className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}>Tracking</NavLink>
            <NavLink to="/profile" className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}>Profile</NavLink>
          </nav>

          <div className="navRight">
            <div className="search" role="search">
              <span aria-hidden="true" style={{ fontWeight: 900, color: "var(--muted)" }}>⌕</span>
              <input
                aria-label="Search restaurants"
                placeholder="Search restaurants…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="pill pillPrimary" onClick={() => setCartOpen(true)} aria-label="Open cart">
              Cart <span className="badge" aria-hidden="true">+</span>
            </button>

            <button className="pill" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
              {theme === "light" ? "Dark" : "Light"}
            </button>
          </div>
        </div>
      </header>

      <main className="appShell">
        <div className="container">
          <div className="grid">
            {sidebarVisible ? (
              <aside className="sidebar" aria-label="Categories">
                <div className="sidebarHeader">Categories</div>
                <div className="sidebarList">
                  {categories.map((c) => (
                    <button
                      key={c}
                      className={`sidebarItem ${c === activeCategory ? "sidebarItemActive" : ""}`}
                      onClick={() => setActiveCategory(c)}
                      aria-pressed={c === activeCategory}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </aside>
            ) : (
              <div />
            )}

            <section aria-label="Content">
              <Routes>
                <Route
                  path="/"
                  element={
                    <HomePage
                      searchQuery={searchQuery}
                      activeCategory={activeCategory}
                      onPickCategory={(c) => setActiveCategory(c)}
                    />
                  }
                />
                <Route path="/restaurants/:restaurantId" element={<RestaurantPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/tracking" element={<TrackingPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route
                  path="*"
                  element={
                    <div className="panel">
                      <h1 className="pageTitle">Not found</h1>
                      <p className="pageSub">This page doesn’t exist.</p>
                      <a className="navLink navLinkActive" href="/">Go home</a>
                    </div>
                  }
                />
              </Routes>
            </section>
          </div>
        </div>
      </main>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

export default App;
