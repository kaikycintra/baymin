"""Inventory rules and SQLite queries for the demo."""

from contextlib import closing
from datetime import date, datetime, timezone
from pathlib import Path

from app.core.database import connect


def init_inventory():
    """Create fictional stock only when the remedy tables do not exist yet."""
    with closing(connect()) as db:
        if db.execute("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'remedies'").fetchone():
            return
        db.executescript(Path(__file__).with_name("seed.sql").read_text(encoding="utf-8"))


def list_remedies():
    with closing(connect()) as db:
        remedies = [dict(row) | {"lots": [], "available": 0} for row in db.execute("SELECT * FROM remedies ORDER BY name")]
        by_id = {remedy["id"]: remedy for remedy in remedies}
        for row in db.execute("SELECT * FROM stock_lots ORDER BY expiry, id"):
            lot = dict(row)
            lot["expired"] = lot["expiry"] < date.today().isoformat()
            remedy = by_id[lot["remedy_id"]]
            remedy["lots"].append(lot)
            if not lot["expired"]:
                remedy["available"] += lot["quantity"]
        return remedies


def adjust_stock(remedy_id: str, lot_id: str, action: str, quantity: int, reason: str):
    if action not in ("used", "received", "discarded") or quantity <= 0 or len(reason.strip()) < 3:
        raise ValueError("Invalid stock adjustment")
    with closing(connect()) as db:
        try:
            db.execute("BEGIN IMMEDIATE")
            lot = db.execute("SELECT quantity, expiry FROM stock_lots WHERE id = ? AND remedy_id = ?", (lot_id, remedy_id)).fetchone()
            if lot is None:
                raise LookupError("Stock lot not found")
            if action != "discarded" and lot["expiry"] < date.today().isoformat():
                raise ValueError("Expired stock cannot be used or received")
            change = quantity if action == "received" else -quantity
            if lot["quantity"] + change < 0:
                raise ValueError("Insufficient stock in this lot")
            now = datetime.now(timezone.utc).isoformat()
            db.execute("UPDATE stock_lots SET quantity = quantity + ?, updated_at = ? WHERE id = ?", (change, now, lot_id))
            db.execute("INSERT INTO stock_movements (lot_id, change, reason, recorded_at) VALUES (?, ?, ?, ?)", (lot_id, change, f"{action}: {reason}", now))
            db.commit()
        except Exception:
            db.rollback()
            raise
    return list_remedies()
