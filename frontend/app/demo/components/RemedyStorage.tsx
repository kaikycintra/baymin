// Save as: app/demo/components/RemedyStorage.tsx (NEW)
import { useEffect, useState } from "react";
import "./remedy-storage.css";

/** Same shape the onboard server returns to RemedyInventory (GET /api/v1/remedies). */
interface StockLot {
  id: string;
  quantity: number;
  expiry: string;
  location: string;
  updated_at: string;
  expired: boolean;
}

interface Remedy {
  id: string;
  name: string;
  form: string;
  intended_use: string;
  storage: string;
  guidance: string;
  unit: string;
  available: number;
  lots: StockLot[];
}

const SHOWN_FIRST = 5;
const ERROR_TEXT = "Inventory is unavailable. Check the onboard server connection.";

/**
 * Read-only view of the remedy storage held by the base server: what is on hand, in which lots,
 * where it is kept, and what has expired. Loads from the same endpoint as RemedyInventory, so stock
 * changes the medical officer records there show up here after a refresh.
 */
export function RemedyStorage() {
  const [remedies, setRemedies] = useState<Remedy[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch("/api/v1/remedies", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Inventory is unavailable.");
        return response.json() as Promise<{ remedies: Remedy[] }>;
      })
      .then((data) => setRemedies(data.remedies))
      .catch(() => {
        if (controller.signal.aborted) return;
        setRemedies(null);
        setError(ERROR_TEXT);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [refreshCount]);

  // Remedies with an expired lot first, so they are never hidden behind "Show all".
  const sorted = remedies
    ? [...remedies].sort((a, b) => Number(b.lots.some((l) => l.expired)) - Number(a.lots.some((l) => l.expired)))
    : [];
  const lotCount = sorted.reduce((total, r) => total + r.lots.length, 0);
  const expiredLots = sorted.reduce((total, r) => total + r.lots.filter((l) => l.expired).length, 0);
  const visible = showAll ? sorted : sorted.slice(0, SHOWN_FIRST);

  return (
    <div className="rs">
      <div className="section-heading compact-heading">
        <div><span className="eyebrow">ONBOARD SUPPLIES · FICTIONAL DEMO DATA</span><h2>Remedy storage</h2></div>
        <button className="text-action rs-refresh" type="button" disabled={loading} onClick={() => setRefreshCount((c) => c + 1)}>
          Refresh
        </button>
      </div>

      {loading && !remedies && <p className="inbox-empty" role="status">Loading inventory…</p>}
      {error && <p className="inventory-error" role="alert">{error}</p>}
      {!loading && !error && remedies && remedies.length === 0 && <p className="inbox-empty">No remedies in the catalog.</p>}

      {remedies && remedies.length > 0 && (
        <>
          <p className="rs-summary">
            {sorted.length} {sorted.length === 1 ? "remedy" : "remedies"} · {lotCount} {lotCount === 1 ? "lot" : "lots"} ·{" "}
            <span className={expiredLots > 0 ? "tone-red" : ""}>{expiredLots === 0 ? "none expired" : `${expiredLots} expired`}</span>
          </p>

          <div className="remedy-list" aria-label="Remedies in storage">
            {visible.map((remedy) => {
              const expired = remedy.lots.filter((l) => l.expired).length;
              const open = openId === remedy.id;
              const panelId = `rs-${remedy.id}`;
              return (
                <div key={remedy.id}>
                  <button
                    className={`remedy-item ${open ? "is-selected" : ""}`}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenId(open ? null : remedy.id)}
                  >
                    <span><strong>{remedy.name}</strong><small>{remedy.form}</small></span>
                    <span>
                      {remedy.available} {remedy.unit}
                      {expired > 0 && <small className="tone-red">{expired} EXPIRED LOT{expired === 1 ? "" : "S"}</small>}
                    </span>
                  </button>
                  {open && (
                    <div className="rs-detail" id={panelId}>
                      <p><strong>Storage requirement:</strong> {remedy.storage}.</p>
                      <div className="remedy-lots">
                        <div className="remedy-lot remedy-lot-head"><span>LOT / LOCATION</span><span>ON HAND</span><span>EXPIRY</span></div>
                        {remedy.lots.map((lot) => (
                          <div className="remedy-lot" key={lot.id}>
                            <span>
                              <strong>{lot.id}</strong>
                              <small>{lot.location}</small>
                              <small>Updated {new Date(lot.updated_at).toLocaleString()}</small>
                            </span>
                            <strong>{lot.quantity} {remedy.unit}</strong>
                            <span className={lot.expired ? "tone-red" : ""}>{lot.expiry}{lot.expired ? " · EXPIRED" : ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {sorted.length > SHOWN_FIRST && (
            <button className="text-action" type="button" aria-expanded={showAll} onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Show fewer" : `Show all ${sorted.length} remedies`}
            </button>
          )}
        </>
      )}
    </div>
  );
}