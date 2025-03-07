from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.course import Course, student_course_review
from models.faculty import Faculty
from models.user import User
from schemas.course import CourseCreate, CourseResponse, CourseReview
from auth.auth import get_current_user
from sqlalchemy import func, text

# GET /: Recupera tutti i corsi
# POST /: Permette agli admin di creare un nuovo corso
# POST /review/: Permette agli studenti di aggiungere una recensione/voto a un corso

router = APIRouter()

# Ottenere tutti i corsi
@router.get("/", response_model=list[CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    # Query per ottenere i corsi e la media dei rating (utilizzando outerjoin per includere anche corsi senza review)
    query = db.query(
        Course,
        func.avg(student_course_review.c.rating).label("avg_rating")
    ).outerjoin(
        student_course_review, student_course_review.c.course_id == Course.id
    ).group_by(Course.id)
    
    results = query.all()
    
    # Creiamo la lista di dizionari con i dati da restituire
    courses_response = []
    for course, avg_rating in results:
        courses_response.append({
            "id": course.id,
            "name": course.name,
            "description": course.description,
            "faculty_id": course.faculty_id,
            "average_rating": float(avg_rating) if avg_rating is not None else 0.0
        })
    return courses_response

# Aggiungere un nuovo corso (solo admin)
@router.post("/", response_model=CourseResponse)
def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Controlliamo se la facoltà esiste
    faculty = db.query(Faculty).filter(Faculty.id == course.faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")

    new_course = Course(name=course.name, description=course.description, faculty_id=course.faculty_id)
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

# Aggiungere una recensione a un corso
@router.post("/review/")
def add_review(
    review: CourseReview,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db.execute(
        text("INSERT INTO student_course_review (student_id, course_id, rating, review) VALUES (:student_id, :course_id, :rating, :review)"),
        {
            "student_id": current_user["id"],
            "course_id": review.course_id,
            "rating": review.rating,
            "review": review.review,
        }
    )
    db.commit()
    return {"message": "Review added successfully"}

@router.get("/faculty/{faculty_id}", response_model=list[CourseResponse])
def get_courses_by_faculty(faculty_id: int, db: Session = Depends(get_db)):
    # Query per ottenere i corsi appartenenti a una specifica facoltà e la media dei rating
    query = db.query(
        Course,
        func.avg(student_course_review.c.rating).label("avg_rating")
    ).outerjoin(
        student_course_review, student_course_review.c.course_id == Course.id
    ).filter(
        Course.faculty_id == faculty_id
    ).group_by(Course.id)
    
    results = query.all()
    
    courses_response = []
    for course, avg_rating in results:
        courses_response.append({
            "id": course.id,
            "name": course.name,
            "description": course.description,
            "faculty_id": course.faculty_id,
            "average_rating": float(avg_rating) if avg_rating is not None else 0.0
        })
    return courses_response

