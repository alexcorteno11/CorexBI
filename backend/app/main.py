from fastapi import FastAPI

from app.api.analytics import router as analytics_router
from app.api.inventory import router as inventory_router
from app.api.products import router as products_router

app = FastAPI(
    title="CorexBI API",
    description="Business intelligence platform for sales and inventory analytics",
    version="0.2.0",
)


app.include_router(analytics_router)
app.include_router(inventory_router)
app.include_router(products_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to CorexBI API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}
