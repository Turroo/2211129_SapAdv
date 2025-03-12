from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.course import Course
from models.review import Review
from models.user import User
from models.teacher import Teacher
from schemas.course import CourseCreate, CourseResponse
from schemas.review import ReviewCreate, ReviewResponse
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

# 📌 Aggiungere una recensione
@router.post("/{course_id}/reviews", response_model=ReviewResponse)
def add_review(course_id: int, review: ReviewCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Usa l'ID dello studente direttamente dall'utente autenticato
    student_id = current_user.id  # Ottieni l'ID dello studente loggato

    # Verifica che l'utente esista nella tabella users
    user = db.query(User).filter(User.id == student_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Controlla se il corso esiste
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    
    # Controlla se l'utente ha già lasciato una recensione per questo corso
    existing_review = db.query(Review).filter(Review.course_id == course_id, Review.student_id == student_id).first()

    if existing_review:
        # Se una recensione esiste già, permetti di modificarla
        existing_review.rating_clarity = review.rating_clarity
        existing_review.rating_feasibility = review.rating_feasibility
        existing_review.rating_availability = review.rating_availability
        existing_review.comment = review.comment
        
        db.commit()
        db.refresh(existing_review)
        
        return existing_review
    else:
        # Se non esiste, crea una nuova recensione
        new_review = Review(
            course_id=course_id,
            student_id=student_id,  # Usa lo student_id dell'utente loggato
            rating_clarity=review.rating_clarity,
            rating_feasibility=review.rating_feasibility,
            rating_availability=review.rating_availability,
            comment=review.comment
        )

        db.add(new_review)
        db.commit()
        db.refresh(new_review)

        return new_review

# 📌 Ottenere tutte le recensioni di un corso
@router.get("/{course_id}/reviews", response_model=list[ReviewResponse])
def get_course_reviews(course_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.course_id == course_id).all()
    if not reviews:
        raise HTTPException(status_code=404, detail="No reviews found for this course.")
    return reviews

# 📌 Ottenere tutte le recensioni di uno studente
@router.get("/students/{student_id}/reviews", response_model=list[ReviewResponse])
def get_student_reviews(student_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.student_id == student_id).all()
    if not reviews:
        raise HTTPException(status_code=404, detail="No reviews found for this student.")
    return reviews

# 📌 Modificare una recensione
@router.put("/reviews/{review_id}", response_model=ReviewResponse)
def update_review(review_id: int, updated_review: ReviewCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")
    
    if review.student_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="You can only edit your own reviews.")

    review.rating_clarity = updated_review.rating_clarity
    review.rating_feasibility = updated_review.rating_feasibility
    review.rating_availability = updated_review.rating_availability
    review.comment = updated_review.comment

    db.commit()
    db.refresh(review)

    return review

# 📌 Eliminare una recensione
@router.delete("/reviews/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")
    
    if review.student_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="You can only delete your own reviews.")

    db.delete(review)
    db.commit()

    return {"message": "Review deleted successfully"}

# 📌 Ottenere la media dei voti di un corso
@router.get("/{course_id}/ratings")
def get_course_ratings(course_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.course_id == course_id).all()
    
    if not reviews:
        raise HTTPException(status_code=404, detail="No ratings found for this course.")

    avg_clarity = sum(r.rating_clarity for r in reviews) / len(reviews)
    avg_feasibility = sum(r.rating_feasibility for r in reviews) / len(reviews)
    avg_availability = sum(r.rating_availability for r in reviews) / len(reviews)

    return {
        "course_id": course_id,
        "average_clarity": avg_clarity,
        "average_feasibility": avg_feasibility,
        "average_availability": avg_availability
    }