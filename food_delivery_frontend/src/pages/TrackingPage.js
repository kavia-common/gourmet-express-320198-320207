import React, { useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../state/AppContext";
import { Panel } from "../components/ui";

// PUBLIC_INTERFACE
export default function TrackingPage() {
  const navigate = useNavigate();
  const { activeOrder, tracking, refreshTracking, clearOrder } = useContext(AppContext);

  useEffect(() => {
    refreshTracking();
    const t = setInterval(() => refreshTracking(), 5000);
    return () => clearInterval(t);
  }, [refreshTracking]);

  const statusLine = useMemo(() => {
    if (!activeOrder) return "No active order. Place an order to see tracking.";
    return `Tracking ${activeOrder.id} • ${tracking.mode === "api" ? "Live" : "Simulated"} updates`;
  }, [activeOrder, tracking.mode]);

  return (
    <div>
      <div className="menuHeader">
        <div>
          <h1 className="pageTitle">Order tracking</h1>
          <p className="pageSub">{statusLine}</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btnGhost" onClick={() => navigate("/")}>Home</button>
          {activeOrder ? (
            <button className="btn btnDanger" onClick={() => { clearOrder(); navigate("/"); }}>
              Clear order
            </button>
          ) : (
            <button className="btn btnAmber" onClick={() => navigate("/")}>Start an order</button>
          )}
        </div>
      </div>

      <Panel
        title="Timeline"
        subtitle="We’ll refresh automatically every few seconds."
        right={<span className="smallNote">{tracking.mode === "api" ? "Backend" : "Mock"} mode</span>}
      >
        <div className="trackSteps">
          {(tracking.steps || []).map((s) => (
            <div key={s.key} className={`step ${s.active ? "stepActive" : ""}`}>
              <div className="stepTitle">{s.title}</div>
              <div className="stepMeta">{s.meta}</div>
            </div>
          ))}
          {(!tracking.steps || tracking.steps.length === 0) ? (
            <div className="step">
              <div className="stepTitle">Waiting</div>
              <div className="stepMeta">Place an order to begin tracking.</div>
            </div>
          ) : null}
        </div>
      </Panel>

      {activeOrder ? (
        <div className="panel">
          <div className="rowBetween">
            <div>
              <strong>Need to update your profile?</strong>
              <div className="smallNote">Address & payment can be edited any time.</div>
            </div>
            <button className="btn btnAmber" onClick={() => navigate("/profile")}>Profile</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
