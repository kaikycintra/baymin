"""Configuration shared by onboard Baymin features."""

from pathlib import Path
import os


DB_PATH = Path(os.getenv("BAYMIN_DB_PATH", Path(__file__).resolve().parents[2] / "baymin.sqlite3"))
