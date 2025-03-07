from fastapi import FastAPI
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from routes.course import router as course_router
from models.course import Course
from models.faculty import Faculty
from models.user_course import user_courses
from database.database import engine, Base

app = FastAPI()
security = HTTPBearer()

# Creazione delle tabelle solo per il servizio CourseManagement
print("Initializing Course Management database...")
Base.metadata.create_all(bind=engine)
print("Course Management Database initialized successfully!")

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

# Inclusione delle route specifiche per la gestione dei corsi
app.include_router(course_router, prefix="/courses")

@app.get("/")
def root():
    return {"message": "Courses Microservice is running!"}
