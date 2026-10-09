from fastapi import FastAPI

app = FastAPI(
    title="CorexBI API",
    description="API for sales analytics and inventory management",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "message": "Welcome to CorexBI API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}
