from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from typing import List
from sqlalchemy.orm import Session
from database.database import get_db
from models.user import User
from models.faculty import Faculty
from models.course import Course
from models.teacher import Teacher
from models.note import Note
from models.review import Review
from models.report import Report
from database.mongo import fs
from auth.auth import get_current_user
from models.note_ratings import NoteRating
from schemas.admin import (
    UserResponse, UserDeleteResponse,
    NoteResponse, NoteDeleteResponse,
    ReviewResponse, ReviewDeleteResponse,
    FacultyResponse, FacultyCreate,
    CourseResponse, CourseCreate,
    TeacherResponse, NoteRatingResponse, NoteRatingDeleteResponse, TeacherCreate,
)

from schemas.report import ReportResponse

router = APIRouter()

def reset_sequence(db, table_name, column_name):
    """ Reset the sequence to the next available ID, avoiding conflicts. """
    db.execute(text(f"""
        SELECT setval(pg_get_serial_sequence('{table_name}', '{column_name}'), 
                      COALESCE((SELECT MAX({column_name}) FROM {table_name}) + 1, 1), false)
    """))
    db.commit()


# 🔍 1️⃣ **Gestione utenti**
@router.get("/users/{user_id}", response_model=UserResponse)
def get_user_detail(user_id: int, db: Session = Depends(get_db), admin=Depends(get_current_user)):
    if not admin.is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.delete("/users/{user_id}", response_model=UserDeleteResponse)
def delete_user(user_id: int, db: Session = Depends(get_db), admin=Depends(get_current_user)):
    if not admin.is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == admin.id:
        raise HTTPException(status_code=403, detail="Admins cannot delete themselves")
    
    db.delete(user)
    db.commit()

    reset_sequence(db, "users", "id")
    return {"message": "User deleted successfully"}

# 📝 2️⃣ **Gestione note e recensioni**
@router.get("/notes", response_model=List[NoteResponse])
def get_notes(db: Session = Depends(get_db), admin=Depends(get_current_user)):
    if not admin.is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return db.query(Note).all()

@router.delete("/notes/{note_id}", response_model=NoteDeleteResponse)
def delete_note(note_id: int, db: Session = Depends(get_db), admin=Depends(get_current_user)):
    if not admin.is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized")

    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    try:
        fs.delete(note.file_id)
    except:
        pass  # Se il file non esiste

    db.delete(note)
    db.commit()

    # Reset sequence
    reset_sequence(db, "notes", "id")
    return {"message": "Note deleted successfully"}

@router.get("/reviews", response_model=List[ReviewResponse])
def get_reviews(db: Session = Depends(get_db), admin=Depends(get_current_user)):
    if not admin.is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return db.query(Review).all()

@router.delete("/reviews/{review_id}", response_model=ReviewDeleteResponse)
def delete_review(review_id: int, db: Session = Depends(get_db), admin=Depends(get_current_user)):
    if not admin.is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized")

    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    db.delete(review)
    db.commit()

    reset_sequence(db, "reviews", "id")
    return {"message": "Review deleted successfully"}

# 🏫 3️⃣ **Gestione facoltà e corsi**
@router.get("/faculties", response_model=List[FacultyResponse])
def get_faculties(db: Session = Depends(get_db), admin=Depends(get_current_user)):
    return db.query(Faculty).all()

@router.post("/faculties", response_model=FacultyResponse)
def add_faculty(faculty: FacultyCreate, db: Session = Depends(get_db), admin=Depends(get_current_user)):
    new_faculty = Faculty(name=faculty.name)
    db.add(new_faculty)
    db.commit()
    return new_faculty

@router.delete("/faculties/{faculty_id}")
def delete_faculty(faculty_id: int, db: Session = Depends(get_db), admin=Depends(get_current_user)):
    faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    
    db.delete(faculty)
    db.commit()

    reset_sequence(db, "faculties", "id")
    return {"message": "Faculty deleted successfully"}

# 👨‍🏫 4️⃣ **Gestione insegnanti**
@router.get("/teachers", response_model=List[TeacherResponse])
def get_all_teachers(db: Session = Depends(get_db), admin=Depends(get_current_user)):
    return db.query(Teacher).all()

@router.get("/courses/{course_id}/teachers", response_model=List[TeacherResponse])
def get_teacher_by_course(course_id: int, db: Session = Depends(get_db), admin=Depends(get_current_user)):
    return db.query(Teacher).join(Course).filter(Course.id == course_id).all()

@router.delete("/teachers/{teacher_id}")
def delete_teacher(teacher_id: int, db: Session = Depends(get_db), admin=Depends(get_current_user)):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    db.delete(teacher)
    db.commit()

    reset_sequence(db, "teachers", "id")
    return {"message": "Teacher deleted successfully"}

@router.get("/note-ratings", response_model=List[NoteRatingResponse])
def get_note_ratings(db: Session = Depends(get_db), admin=Depends(get_current_user)):
    if not admin.is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return db.query(NoteRating).all()

@router.delete("/note-ratings/{rating_id}", response_model=NoteRatingDeleteResponse)
def delete_note_rating(rating_id: int, db: Session = Depends(get_db), admin=Depends(get_current_user)):
    if not admin.is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized")

    rating = db.query(NoteRating).filter(NoteRating.id == rating_id).first()
    if not rating:
        raise HTTPException(status_code=404, detail="Note rating not found")

    db.delete(rating)
    db.commit()
    return {"message": "Note rating deleted successfully"}

# 📚 **5️⃣ Gestione Corsi**

@router.get("/courses", response_model=List[CourseResponse])
def get_courses(db: Session = Depends(get_db), admin=Depends(get_current_user)):
    """✅ Ottiene tutti i corsi (solo per admin)"""
    if not admin.is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return db.query(Course).all()


@router.get("/faculties/{faculty_id}/courses", response_model=List[CourseResponse])
def get_courses_by_faculty(faculty_id: int, db: Session = Depends(get_db), admin=Depends(get_current_user)):
    """✅ Ottiene tutti i corsi di una specifica facoltà (solo per admin)"""
    if not admin.is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized")

    courses = db.query(Course).filter(Course.faculty_id == faculty_id).all()
    
    if not courses:
        raise HTTPException(status_code=404, detail="No courses found for this faculty")

    return courses


@router.delete("/courses/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """ Deletes a course and resets the course sequence. """
    
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Permission denied")

    course = db.query(Course).filter(Course.id == course_id).first()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    db.delete(course)
    db.commit()

    # Reset sequence
    reset_sequence(db, "courses", "id")

    return {"message": "Course deleted successfully"}


@router.post("/teachers", response_model=TeacherResponse)
def add_teacher(teacher: TeacherCreate, db: Session = Depends(get_db), admin=Depends(get_current_user)):
    """✅ Aggiunge un nuovo insegnante (solo per admin)"""
    if not admin.is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    new_teacher = Teacher(name=teacher.name)
    db.add(new_teacher)
    db.commit()
    db.refresh(new_teacher)
    return new_teacher

@router.post("/courses", response_model=CourseResponse)
def add_course(course: CourseCreate, db: Session = Depends(get_db), admin=Depends(get_current_user)):
    """✅ Aggiunge un nuovo corso (solo per admin)"""
    if not admin.is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    new_course = Course(
        name=course.name,
        faculty_id=course.faculty_id,
        teacher_id=course.teacher_id
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course


@router.get("/reports", response_model=List[ReportResponse])
def get_all_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can view reports.")

    return db.query(Report).all()

@router.delete("/reports/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete reports.")
    
    report = db.query(Report).filter(Report.id_report == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully."}