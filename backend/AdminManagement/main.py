from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, Base, get_db
from routes.admin import router as admin_router

app = FastAPI()
# Aggiungi il middleware CORS alla tua app FastAPI
origins = [
    "http://localhost:3000",  # Consenti richieste da questa origine (dove si trova il tuo frontend React)
    "http://localhost:8005",  # Se hai bisogno di consentire anche il backend stesso
    # Puoi aggiungere altre origini se necessario
]

# Middleware per CORS (per comunicare con il frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Modifica con i domini del tuo frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusione delle route specifiche per la gestione degli appunti
app.include_router(admin_router, prefix="/admin")

@app.get("/")
def root():
    return {"message": "Admin Management Microservice is running!"}
