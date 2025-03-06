from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.faculty import Faculty
from schemas.faculty import FacultyCreate, FacultyResponse
from auth.auth import get_current_user  # Per autenticazione admin

router = APIRouter()

# Ottenere tutte le facoltà
@router.get("/", response_model=list[FacultyResponse])
def get_faculties(db: Session = Depends(get_db)):
    faculties = db.query(Faculty).all()
    return faculties

#  Aggiungere una nuova facoltà (solo admin)
@router.post("/", response_model=FacultyResponse)
def create_faculty(
    faculty: FacultyCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)  # Solo admin
):
    # Controlliamo se l'utente è admin
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Permission denied")

    new_faculty = Faculty(name=faculty.name)
    db.add(new_faculty)
    db.commit()
    db.refresh(new_faculty)
    return new_faculty
