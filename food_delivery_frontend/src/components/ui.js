import React, { useEffect } from "react";

// PUBLIC_INTERFACE
export function money(amount) {
  const n = Number(amount || 0);
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

// PUBLIC_INTERFACE
export function Toast({ message, onDone, durationMs = 2200 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onDone?.(), durationMs);
    return () => clearTimeout(t);
  }, [durationMs, message, onDone]);

  if (!message) return null;
  return <div className="toast" role="status" aria-live="polite">{message}</div>;
}

// PUBLIC_INTERFACE
export function Panel({ title, subtitle, right, children }) {
  return (
    <section className="panel">
      {(title || subtitle || right) && (
        <div className="sectionHeader">
          <div>
            {title ? <h2 className="pageTitle" style={{ fontSize: 18, margin: 0 }}>{title}</h2> : null}
            {subtitle ? <p className="pageSub" style={{ margin: "6px 0 0" }}>{subtitle}</p> : null}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
