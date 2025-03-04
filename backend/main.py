from fastapi import FastAPI
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.routes.auth import router as auth_router
from backend.routes.user import router as user_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
security = HTTPBearer()

# Aggiungi il middleware CORS alla tua app FastAPI
origins = [
    "http://localhost:3000",  # Consenti richieste da questa origine (dove si trova il tuo frontend React)
    "http://localhost:8000",  # Se hai bisogno di consentire anche il backend stesso
    # Puoi aggiungere altre origini se necessario
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Le origini che sono permesse per fare richieste
    allow_credentials=True,
    allow_methods=["*"],  # Consenti tutti i metodi HTTP
    allow_headers=["*"],  # Consenti tutte le intestazioni
)

# Inclusione delle route
app.include_router(auth_router, prefix="/auth")
app.include_router(user_router, prefix="/users")

@app.get("/")
def root():
    return {"message": "Sapienza Advisor API is running!"}