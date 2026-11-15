"""HTTP presentation for remedy inventory."""

from fastapi import APIRouter, HTTPException

from . import models, service


router = APIRouter(prefix="/api/v1/remedies")


@router.get("", response_model=models.RemedyList)
def get_remedies():
    return {"demo": True, "remedies": service.list_remedies()}


@router.post("/{remedy_id}/stock-adjustments", response_model=models.RemedyList)
def adjust_stock(remedy_id: str, adjustment: models.StockAdjustment):
    try:
        remedies = service.adjust_stock(remedy_id, adjustment.lot_id, adjustment.action, adjustment.quantity, adjustment.reason)
    except LookupError as error:
        raise HTTPException(404, str(error)) from error
    except ValueError as error:
        raise HTTPException(409, str(error)) from error
    return {"demo": True, "remedies": remedies}
