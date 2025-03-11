from fastapi import FastAPI
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from routes.faculty import router as faculty_router
from models.teacher import Teacher
from database.database import engine, Base

app = FastAPI()
security = HTTPBearer()

# Creazione delle tabelle solo per Faculty, Course e Teacher
print("Initializing Faculty Service database...")
Base.metadata.create_all(bind=engine)
print("Faculty Service Database initialized successfully!")




# Aggiungi il middleware CORS alla tua app FastAPI
origins = [
    "http://localhost:3000",  # Consenti richieste da questa origine (dove si trova il tuo frontend React)
    "http://localhost:8002",  # Se hai bisogno di consentire anche il backend stesso
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
app.include_router(faculty_router, prefix="/faculties")

@app.get("/")
def root():
    return {"message": "Faculties Microservice is running!"}


