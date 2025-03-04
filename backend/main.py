from fastapi import FastAPI
from backend.auth.auth import router as auth_router

app = FastAPI()

app.include_router(auth_router, prefix="/auth")

@app.get("/")
def root():
    return {"message": "Sapienza Advisor API is running!"}
