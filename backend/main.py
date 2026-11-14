from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict
from pathlib import Path
import os

app = FastAPI()

PROJECT_ROOT = Path(__file__).parent.parent
DIST_DIR = PROJECT_ROOT / "frontend" / "dist"
ENVIRONMENT = os.getenv("FASTAPI_ENV", "production")

if ENVIRONMENT == "production":
    app.frontend(
        "/", 
        directory=str(DIST_DIR), 
        fallback="index.html", 
    )