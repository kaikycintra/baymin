"""Baymin onboard API entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.remedies.service import init_inventory
from app.remedies.views import router as remedies_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_inventory()
    yield


app = FastAPI(title="Baymin Onboard API", lifespan=lifespan)
app.include_router(remedies_router)
