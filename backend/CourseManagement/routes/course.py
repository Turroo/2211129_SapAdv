from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.course import Course
from models.teacher import Teacher
from schemas.course import CourseCreate, CourseResponse
from auth.auth import get_current_user  # Per autenticazione admin

router = APIRouter()

# 📌 Ottenere tutti i corsi
@router.get("/", response_model=list[CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    return courses

# ✅ API per creare un nuovo corso (solo admin)
@router.post("/", response_model=CourseResponse)
def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Controlla se l'utente è admin
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Permission denied. Only admins can add courses.")

    # ❌ Controlla se esiste già un corso con lo stesso nome
    existing_course = db.query(Course).filter(Course.name == course.name).first()
    if existing_course:
        raise HTTPException(status_code=400, detail="A course with this name already exists.")

    # Controlla se il docente esiste
    teacher = db.query(Teacher).filter(Teacher.id == course.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found.")

    # ✅ Crea il nuovo corso
    new_course = Course(
        name=course.name,
        faculty_id=course.faculty_id,
        teacher_id=course.teacher_id
    )
    
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    
    return new_course

# 📌 Ottenere i corsi appartenenti a una specifica facoltà
@router.get("/faculty/{faculty_id}", response_model=list[CourseResponse])
def get_courses_by_faculty(faculty_id: int, db: Session = Depends(get_db)):
    courses = db.query(Course).filter(Course.faculty_id == faculty_id).all()
    if not courses:
        raise HTTPException(status_code=404, detail="No courses found for this faculty")
    return courses

# 📌 Ottenere il professore di un corso
@router.get("/{course_id}/teacher", response_model=dict)
def get_course_teacher(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    teacher = db.query(Teacher).filter(Teacher.id == course.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    return {"teacher_id": teacher.id, "name": teacher.name}
