"""API models for the fictional remedy inventory."""

from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, Field, StringConstraints


class StockLot(BaseModel):
    id: str
    remedy_id: str
    quantity: int
    expiry: str
    location: str
    updated_at: datetime
    expired: bool


class Remedy(BaseModel):
    id: str
    name: str
    form: str
    intended_use: str
    storage: str
    guidance: str
    unit: str
    available: int
    lots: list[StockLot]


class RemedyList(BaseModel):
    demo: bool
    remedies: list[Remedy]


class StockAdjustment(BaseModel):
    lot_id: str
    action: Literal["used", "received", "discarded"]
    quantity: int = Field(gt=0)
    reason: Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=180)]
