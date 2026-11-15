BEGIN TRANSACTION;

CREATE TABLE remedies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    form TEXT NOT NULL,
    intended_use TEXT NOT NULL,
    storage TEXT NOT NULL,
    guidance TEXT NOT NULL,
    unit TEXT NOT NULL
);

CREATE TABLE stock_lots (
    id TEXT PRIMARY KEY,
    remedy_id TEXT NOT NULL REFERENCES remedies(id),
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    expiry TEXT NOT NULL,
    location TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE stock_movements (
    id INTEGER PRIMARY KEY,
    lot_id TEXT NOT NULL REFERENCES stock_lots(id),
    change INTEGER NOT NULL CHECK (change != 0),
    reason TEXT NOT NULL,
    recorded_at TEXT NOT NULL
);

INSERT INTO remedies VALUES
    ('relief-a', 'Demo Relief Pack A', 'sealed pack', 'Fictional comfort support for a simulated minor complaint', 'Dry cabinet; follow kit label', 'DEMO-PROC-01 · CMO review required', 'packs'),
    ('hydrate-b', 'Demo Hydration Sachet B', 'sealed sachet', 'Fictional hydration support for a simulated routine check', 'Dry cabinet; follow kit label', 'DEMO-PROC-02 · CMO review required', 'sachets'),
    ('skin-c', 'Demo Skin Kit C', 'sealed kit', 'Fictional skin-care supply for a simulated minor event', 'Clean, dry cabinet; follow kit label', 'DEMO-PROC-03 · CMO review required', 'kits');

INSERT INTO stock_lots VALUES
    ('A-001', 'relief-a', 8, '2028-06-30', 'Habitat / medical locker 1', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('A-002', 'relief-a', 4, '2028-12-31', 'Rover / medical pouch', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('B-001', 'hydrate-b', 16, '2028-09-30', 'Habitat / medical locker 1', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('C-001', 'skin-c', 3, '2028-03-31', 'Habitat / medical locker 2', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

COMMIT;
