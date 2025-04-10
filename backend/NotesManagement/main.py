from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, Base, get_db
from routes.notes import router as note_router
from models.note import Note
from models.user import User
from models.course import Course
from models.teacher import Teacher

app = FastAPI()
# Aggiungi il middleware CORS alla tua app FastAPI
origins =[""]

# Middleware per CORS (per comunicare con il frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Modifica con i domini del tuo frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusione delle route specifiche per la gestione degli appunti
app.include_router(note_router, prefix="/notes")

@app.get("/")
def root():
    return {"message": "Notes Management Microservice is running!"}
