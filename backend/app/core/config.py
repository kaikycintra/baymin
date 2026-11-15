"""Configuration shared by onboard Baymax features."""

from pathlib import Path
import os


DB_PATH = Path(os.getenv("BAYMAX_DB_PATH", Path(__file__).resolve().parents[2] / "baymax.sqlite3"))
