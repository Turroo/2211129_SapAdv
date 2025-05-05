from fastapi import FastAPI
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from database.database import engine, Base

app = FastAPI()
security = HTTPBearer()

# Creazione delle tabelle nel database al primo avvio
print("Initializing Auth Service database...")
Base.metadata.create_all(bind=engine)
print("Auth Service Database initialized successfully!")



# Aggiungi il middleware CORS alla tua app FastAPI
origins = [
    "http://localhost:3000",  # Consenti richieste da questa origine (dove si trova il tuo frontend React)
    "http://localhost:8000",  # Se hai bisogno di consentire anche il backend stesso
    # Puoi aggiungere altre origini se necessario
]


# Configurazione CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusione delle route
app.include_router(auth_router, prefix="/auth")

@app.get("/")
def root():
    return {"message": "Auth Microservice is running!"}


