from fastapi import FastAPI
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from routes.course import router as course_router
from models.teacher import Teacher
from models.faculty import Faculty
from models.course import Course
from models.user import User
from models.note import Note
from models.review import Review  # ⚠️ Corretto: le review ora sono sui corsi
from models.note_ratings import NoteRating
from datetime import datetime
from database.database import engine, Base, SessionLocal
from sqlalchemy import text
import bcrypt

app = FastAPI()
security = HTTPBearer()

def reset_all_sequences():
    db = SessionLocal()
    """ Reset di tutte le sequenze del database basandosi sui valori attuali delle tabelle. """
    sequences = db.execute(text("""
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE column_default LIKE 'nextval%'
    """)).fetchall()

    for table, column in sequences:
        db.execute(text(f"""
            SELECT setval(pg_get_serial_sequence('{table}', '{column}'), 
                          COALESCE((SELECT MAX({column}) + 1 FROM {table}), 1), false)
        """))
    
    db.commit()


# Funzione per hashare la password
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

# Funzione per popolare il database
def populate_database():
    db = SessionLocal()
    try:
        # ✅ **Popoliamo le Facoltà**
        if db.query(Faculty).count() == 0:
            faculties = [
                Faculty(id=1, name="Ingegneria Informatica"),
                Faculty(id=2, name="Matematica e Fisica"),
            ]
            db.add_all(faculties)
            db.commit()
            print("✅ Facoltà inserite con successo!")

        # ✅ **Popoliamo i Docenti**
        if db.query(Teacher).count() == 0:
            teachers = [
                Teacher(id=1, name="Mario Rossi"),
                Teacher(id=2, name="Laura Bianchi"),
                Teacher(id=3, name="Giovanni Verdi"),
                Teacher(id=4, name="Anna Neri"),
            ]
            db.add_all(teachers)
            db.commit()
            print("✅ Professori inseriti con successo!")

        # ✅ **Popoliamo i Corsi**
        if db.query(Course).count() == 0:
            courses = [
                Course(id=1, name="Algoritmi e Strutture Dati", faculty_id=1, teacher_id=1),
                Course(id=2, name="Analisi Matematica 1", faculty_id=2, teacher_id=2),
                Course(id=3, name="Meccanica Quantistica", faculty_id=2, teacher_id=3),
            ]
            db.add_all(courses)
            db.commit()
            print("✅ Corsi inseriti con successo!")

        # ✅ **Popoliamo gli Utenti**
        if db.query(User).count() == 0:
            users = [
                User(id=1, email="user1@example.com", hashed_password=hash_password("example"), is_admin=False, first_name="Alice", last_name="Rossi", birth_date="2000-05-12", city="Roma", faculty_id=1),
                User(id=2, email="user2@example.com", hashed_password=hash_password("example"), is_admin=False, first_name="Bob", last_name="Bianchi", birth_date="1999-07-24", city="Milano", faculty_id=2),
                User(id=3, email="user3@example.com", hashed_password=hash_password("example"), is_admin=False, first_name="Charlie", last_name="Verdi", birth_date="2001-02-18", city="Napoli", faculty_id=1),
                User(id=3, email="admin@example.com", hashed_password=hash_password("admin"), is_admin=True, first_name="Super", last_name="Admin", birth_date="2001-02-18", city="Napoli", faculty_id=1)
            ]
            db.add_all(users)
            db.commit()
            print("✅ Utenti inseriti con successo!")


        # ✅ **Popoliamo le Recensioni dei Corsi**
        if db.query(Review).count() == 0:
            reviews = [
                Review(id=1, course_id=1, student_id=1, rating_clarity=5, rating_feasibility=4, rating_availability=5, comment="Corso molto interessante e ben strutturato.", created_at=datetime.utcnow().date()),
                Review(id=2, course_id=2, student_id=2, rating_clarity=3, rating_feasibility=3, rating_availability=4, comment="Analisi è sempre difficile, ma il professore spiega bene.", created_at=datetime.utcnow().date()),
            ]
            db.add_all(reviews)
            db.commit()
            print("✅ Recensioni dei corsi inserite con successo!")
    
    except Exception as e:
        db.rollback()
        print(f"⚠️ Errore durante la popolazione del database: {e}")
    finally:
        db.close()

# Esegui la popolazione del database
try:
    populate_database()
    reset_all_sequences()
except Exception as e:
    print(f"⚠️ Errore durante l'inizializzazione del database: {e}")

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