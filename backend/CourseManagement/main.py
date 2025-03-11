from fastapi import FastAPI
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from routes.course import router as course_router
from models.course import Course
from models.faculty import Faculty
from models.teacher import Teacher
from database.database import engine, Base, SessionLocal

app = FastAPI()
security = HTTPBearer()

# Funzione per popolare la tabella `teachers`
def populate_teachers():
    db = SessionLocal()  # Crea una nuova sessione
    
    try:
        existing_teachers = db.query(Teacher).count()
        if existing_teachers > 0:
            print("⚠️ I professori sono già stati inseriti nel database.")
            return
        
        teachers_data = [
            {"id": 1, "name": "Marco Rossi"},
            {"id": 2, "name": "Giulia Bianchi"},
            {"id": 3, "name": "Luca Verdi"},
            {"id": 4, "name": "Francesca Neri"},
            {"id": 5, "name": "Antonio Esposito"},
        ]

        for teacher_data in teachers_data:
            teacher = Teacher(id=teacher_data["id"], name=teacher_data["name"])
            db.add(teacher)

        db.commit()  # Salva le modifiche
    except Exception as e:
        db.rollback()  # Se c'è un errore, annulla la transazione
        print(f"Errore durante l'inserimento dei professori: {e}")
    finally:
        db.close()  # Chiudi la connessione al database



# Popoliamo i professori solo se necessario
try:
    populate_teachers()
except Exception as e:
    print(f"⚠️ Errore durante la popolazione dei professori: {e}")

# Configurazione CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8003"],  # Solo frontend autorizzato
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# Inclusione delle route specifiche per la gestione dei corsi
app.include_router(course_router, prefix="/courses")

@app.get("/")
def root():
    return {"message": "Courses Microservice is running!"}
