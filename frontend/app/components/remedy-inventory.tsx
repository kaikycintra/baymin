import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type StockLot = {
  id: string;
  quantity: number;
  expiry: string;
  location: string;
  updated_at: string;
  expired: boolean;
};

type Remedy = {
  id: string;
  name: string;
  form: string;
  intended_use: string;
  storage: string;
  guidance: string;
  unit: string;
  available: number;
  lots: StockLot[];
};

type InventoryResponse = { remedies: Remedy[] };

export function RemedyInventory({ canEdit, missionConnected = true }: { canEdit: boolean; missionConnected?: boolean }) {
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);
  const [selectedRemedyId, setSelectedRemedyId] = useState("");
  const [selectedLotId, setSelectedLotId] = useState("");
  const [stockAction, setStockAction] = useState("used");
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockReason, setStockReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [stockMessage, setStockMessage] = useState("");
  const [stockError, setStockError] = useState("");

  useEffect(() => {
    if (!missionConnected) return;
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");
    fetch("/api/v1/remedies", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Inventory is unavailable.");
        return response.json() as Promise<InventoryResponse>;
      })
      .then((data) => setRemedies(data.remedies))
      .catch(() => {
        if (!controller.signal.aborted) {
          setRemedies([]);
          setLoadError("Inventory is unavailable. Check the onboard server connection.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [missionConnected, refreshCount]);

  const selectedRemedy = remedies.find((remedy) => remedy.id === selectedRemedyId) ?? remedies[0];
  const selectedLot = selectedRemedy?.lots.find((lot) => lot.id === selectedLotId) ?? selectedRemedy?.lots[0];
  const invalidChange = !selectedLot || !Number.isInteger(stockQuantity) || stockQuantity < 1 ||
    stockReason.trim().length < 3 ||
    (stockAction !== "received" && stockQuantity > selectedLot.quantity) ||
    (stockAction !== "discarded" && selectedLot.expired);

  async function saveStockChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit || !selectedRemedy || !selectedLot || invalidChange) return;
    setSaving(true);
    setStockError("");
    setStockMessage("");
    try {
      const response = await fetch(`/api/v1/remedies/${selectedRemedy.id}/stock-adjustments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lot_id: selectedLot.id, action: stockAction, quantity: stockQuantity, reason: stockReason.trim() }),
      });
      if (!response.ok) {
        const error = await response.json() as { detail?: unknown };
        throw new Error(typeof error.detail === "string" ? error.detail : "Could not update stock.");
      }
      const data = await response.json() as InventoryResponse;
      setRemedies(data.remedies);
      setStockReason("");
      setStockMessage("Stock change saved on the onboard server.");
    } catch (error) {
      setStockError(error instanceof Error ? error.message : "Could not update stock.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="remedy-section" aria-labelledby="remedy-title">
      <div className="section-heading">
        <div><span className="eyebrow">ONBOARD SUPPLIES · FICTIONAL DEMO DATA</span><h2 id="remedy-title">Remedy catalog & inventory</h2></div>
        {missionConnected && <button className="text-action remedy-refresh" type="button" onClick={() => { setStockMessage(""); setStockError(""); setRefreshCount((count) => count + 1); }} disabled={loading || saving}>Refresh inventory</button>}
      </div>
      <p className="remedy-disclaimer">For workflow demonstration only. These items and procedure references are fictional; they are not treatment instructions. {canEdit ? "Record stock changes after CMO review." : "Inventory is read only in the surgeon view."}</p>
      {!missionConnected ? (
        <p className="remedy-unavailable">No onboard inventory is connected for this mission in the demo.</p>
      ) : (
        <>
          {loading && <p role="status">Loading inventory…</p>}
          {loadError && <p className="inventory-error" role="alert">{loadError}</p>}
          {!loading && !loadError && remedies.length === 0 && <p>No remedies in the catalog.</p>}
          {!loading && !loadError && remedies.length > 0 && (
            <div className="remedy-layout">
              <div className="remedy-list" aria-label="Remedies">
                {remedies.map((remedy) => (
                  <button className={`remedy-item ${selectedRemedy?.id === remedy.id ? "is-selected" : ""}`} type="button" key={remedy.id} onClick={() => { setSelectedRemedyId(remedy.id); setSelectedLotId(""); setStockMessage(""); setStockError(""); }}>
                    <span><strong>{remedy.name}</strong><small>{remedy.form}</small></span>
                    <span>{remedy.available} {remedy.unit}</span>
                  </button>
                ))}
              </div>
              {selectedRemedy && (
                <div className="remedy-detail">
                  <h3>{selectedRemedy.name}</h3>
                  <p><strong>Demo use reference:</strong> {selectedRemedy.intended_use}. {selectedRemedy.guidance}.</p>
                  <p><strong>Storage requirement:</strong> {selectedRemedy.storage}.</p>
                  <div className="remedy-lots">
                    <div className="remedy-lot remedy-lot-head"><span>LOT / LOCATION</span><span>ON HAND</span><span>EXPIRY</span></div>
                    {selectedRemedy.lots.map((lot) => (
                      <div className="remedy-lot" key={lot.id}>
                        <span><strong>{lot.id}</strong><small>{lot.location}</small><small>Updated {new Date(lot.updated_at).toLocaleString()}</small></span>
                        <strong>{lot.quantity} {selectedRemedy.unit}</strong>
                        <span className={lot.expired ? "tone-red" : ""}>{lot.expiry}{lot.expired ? " · EXPIRED" : ""}</span>
                      </div>
                    ))}
                  </div>
                  {canEdit && (
                    <form className="stock-form" onSubmit={saveStockChange}>
                      <span className="eyebrow">RECORD STOCK CHANGE</span>
                      <div className="stock-fields">
                        <label>Lot<select value={selectedLot?.id ?? ""} onChange={(event) => setSelectedLotId(event.target.value)}>{selectedRemedy.lots.map((lot) => <option value={lot.id} key={lot.id}>{lot.id}</option>)}</select></label>
                        <label>Action<select value={stockAction} onChange={(event) => setStockAction(event.target.value)}><option value="used">Used</option><option value="received">Received</option><option value="discarded">Discarded</option></select></label>
                        <label>Quantity<input type="number" min="1" step="1" required value={stockQuantity} onChange={(event) => setStockQuantity(Number(event.target.value))} /></label>
                      </div>
                      <label className="stock-reason">Reason / reference<input value={stockReason} minLength={3} maxLength={180} required placeholder="e.g. demo intervention 01" onChange={(event) => setStockReason(event.target.value)} /></label>
                      <button className="button button-primary" type="submit" disabled={saving || invalidChange}>{saving ? "Saving…" : "Save stock change"}</button>
                      {stockMessage && <p className="stock-success" role="status">{stockMessage}</p>}
                      {stockError && <p className="inventory-error" role="alert">{stockError}</p>}
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
