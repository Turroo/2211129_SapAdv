from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy import text
from typing import List
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from database.database import get_db
from database.mongo import fs
from models.note import Note
from models.course import Course
from models.note_ratings import NoteRating
from models.user import User
from models.report import Report
from schemas.note import NoteCreate, NoteResponse
from schemas.rating import NoteRatingCreate, NoteRatingUpdate, NoteRatingResponse
from schemas.report import ReportCreate, ReportResponse
from auth.auth import get_current_user
from bson.objectid import ObjectId
from io import BytesIO

router = APIRouter()


def reset_sequence(db, table_name, column_name):
    """ Reset the sequence to the next available ID, avoiding conflicts. """
    db.execute(text(f"""
        SELECT setval(pg_get_serial_sequence('{table_name}', '{column_name}'), 
                      COALESCE((SELECT MAX({column_name}) FROM {table_name}) + 1, 1), false)
    """))
    db.commit()


# 🔍 **1. Ottenere gli appunti per un corso**
@router.get("/{course_id}", response_model=list[NoteResponse])
def get_notes(course_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # **Controllo se il corso esiste**
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")

    notes = db.query(Note).filter(Note.course_id == course_id).all()
    return notes

# 📤 **2. Caricare un nuovo appunto**
@router.post("/", response_model=NoteResponse)
def upload_note(
    course_id: int = Form(...),
    description: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # **Verifica che il corso esista**
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")

    # **Verifica che l'utente appartenga alla facoltà del corso**
    if course.faculty_id != current_user.faculty_id:
        raise HTTPException(status_code=403, detail="You are not authorized to upload notes for this course.")

    # **Salva il file in GridFS**
    file_id = fs.put(file.file, filename=file.filename, content_type=file.content_type)

    # **Salva i metadati dell'appunto in PostgreSQL**
    new_note = Note(
        course_id=course_id,
        student_id=current_user.id,
        file_id=str(file_id),
        description=description
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note


# 📝 **3. Modificare un appunto**
@router.put("/{note_id}")
def update_note(note_id: int, description: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    note = db.query(Note).filter(Note.id == note_id, Note.student_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found or unauthorized.")

    note.description = description
    db.commit()
    return {"message": "Note updated successfully."}

# ❌ **4. Eliminare un appunto**
@router.delete("/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # **Recupera l'appunto dal database**
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found.")

    # **Verifica che l'utente sia il proprietario dell'appunto**
    if note.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not authorized to delete this note.")

    # **Elimina il file da GridFS (MongoDB)**
    try:
        fs.delete(ObjectId(note.file_id))  # Cancella il file associato all'appunto
    except Exception:
        pass  # Se il file non esiste, ignora l'errore

    # **Elimina il record dell'appunto dal database PostgreSQL**
    db.delete(note)
    db.commit()

    reset_sequence(db, "notes", "id")
    
    return {"message": "Note and associated file deleted successfully."}

# 📥 **5. Scaricare un appunto (Download)**
@router.get("/download/{note_id}")
def download_note(note_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found.")

    if note.course.faculty_id != current_user.faculty_id:
        raise HTTPException(status_code=403, detail="You are not authorized to download notes for this course.")

    file = fs.get(ObjectId(note.file_id))
    if not file:
        raise HTTPException(status_code=404, detail="File not found in storage.")

    response = StreamingResponse(BytesIO(file.read()), media_type=file.content_type)
    # Rimuove eventuali header duplicati e imposta solo uno.
    if "Content-Disposition" in response.headers:
        del response.headers["Content-Disposition"]
    response.headers["Content-Disposition"] = f'attachment; filename="{file.filename}"'
    return response


# ⭐ **6. Aggiungere una valutazione a una nota**
@router.post("/ratings", response_model=NoteRatingResponse)
def add_rating(
    rating_data: NoteRatingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    note = db.query(Note).filter(Note.id == rating_data.note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found.")

    if note.student_id == current_user.id:
        raise HTTPException(status_code=403, detail="You cannot rate your own note.")

    if current_user.faculty_id != note.course.faculty_id:
        raise HTTPException(status_code=403, detail="You can only rate notes from your faculty's courses.")

    existing_rating = db.query(NoteRating).filter(
        NoteRating.note_id == rating_data.note_id,
        NoteRating.student_id == current_user.id
    ).first()
    if existing_rating:
        raise HTTPException(status_code=400, detail="You have already rated this note.")

    new_rating = NoteRating(
        note_id=rating_data.note_id,
        student_id=current_user.id,
        rating=rating_data.rating,
        comment=rating_data.comment
    )

    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)

    return new_rating

# ✏ **7. Modificare una valutazione**
@router.put("/ratings/{rating_id}", response_model=NoteRatingResponse)
def update_rating(
    rating_id: int,
    rating_data: NoteRatingUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    rating = db.query(NoteRating).filter(
        NoteRating.id == rating_id,
        NoteRating.student_id == current_user.id
    ).first()

    if not rating:
        raise HTTPException(status_code=404, detail="Rating not found or unauthorized.")

    rating.rating = rating_data.rating
    rating.comment = rating_data.comment
    db.commit()
    db.refresh(rating)

    return rating

# ❌ **8. Eliminare una valutazione**
@router.delete("/ratings/{rating_id}")
def delete_rating(
    rating_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    rating = db.query(NoteRating).filter(
        NoteRating.id == rating_id,
        NoteRating.student_id == current_user.id
    ).first()

    if not rating:
        raise HTTPException(status_code=404, detail="Rating not found or unauthorized.")

    db.delete(rating)
    db.commit()

    reset_sequence(db, "note_ratings", "id")

    return {"message": "Rating deleted successfully."}

# 📊 **9. Ottenere la valutazione media degli appunti di un corso**
@router.get("/{course_id}/average-rating")
def get_course_notes_average(course_id: int, db: Session = Depends(get_db)):
    avg_rating = (
        db.query(func.coalesce(func.avg(NoteRating.rating), 0))
        .join(Note, NoteRating.note_id == Note.id)
        .filter(Note.course_id == course_id)
        .scalar()
    )

    return {"course_id": course_id, "average_rating": round(avg_rating, 2)}

# 📑 **10. Ottenere la lista ordinata degli appunti di un corso**
@router.get("/{course_id}/notes-sorted", response_model=list[NoteResponse])
def get_sorted_notes(course_id: int, order: str = "desc", db: Session = Depends(get_db)):
    notes_query = (
        db.query(
            Note,
            func.coalesce(func.avg(NoteRating.rating), -1).label("average_rating")
        )
        .outerjoin(NoteRating, Note.id == NoteRating.note_id)
        .filter(Note.course_id == course_id)
        .group_by(Note.id)
    )

    if order.lower() == "asc":
        notes_query = notes_query.order_by(func.coalesce(func.avg(NoteRating.rating), -1).asc(), Note.created_at.desc())
    else:
        notes_query = notes_query.order_by(func.coalesce(func.avg(NoteRating.rating), -1).desc(), Note.created_at.desc())

    notes = notes_query.all()

    result = [
        {
            "id": note.id,
            "course_id": note.course_id,
            "student_id": note.student_id,
            "file_id": note.file_id,
            "description": note.description,
            "created_at": note.created_at,
            "average_rating": round(average_rating, 2) if average_rating != -1 else None
        }
        for note, average_rating in notes
    ]

    return result

@router.get("/usr/my-notes", response_model=list[NoteResponse])
def get_my_notes(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # **Recupera tutti gli appunti creati dall'utente autenticato**
    user_notes = db.query(Note).filter(Note.student_id == current_user.id).all()

    if not user_notes:
        raise HTTPException(status_code=404, detail="You have not created any notes.")

    return user_notes

@router.get("/usr/my-reviews", response_model=list[NoteRatingResponse])
def get_my_reviews(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # **Recupera tutte le recensioni fatte dall'utente autenticato**
    user_reviews = db.query(NoteRating).filter(NoteRating.student_id == current_user.id).all()

    if not user_reviews:
        raise HTTPException(status_code=404, detail="You have not created any reviews.")

    return user_reviews

# 📊 **7. Ottenere tutte le recensioni di un singolo appunto**
@router.get("/notes/{note_id}/reviews", response_model=list[NoteRatingResponse])
def get_note_reviews(note_id: int, db: Session = Depends(get_db)):
    reviews = db.query(NoteRating).filter(NoteRating.note_id == note_id).all()
    return reviews

# ⭐ **8. Ottenere la media delle recensioni di un singolo appunto**
@router.get("/notes/{note_id}/average-rating")
def get_note_average_rating(note_id: int, db: Session = Depends(get_db)):
    avg_rating = db.query(func.coalesce(func.avg(NoteRating.rating), 0)).filter(NoteRating.note_id == note_id).scalar()
    return {"note_id": note_id, "average_rating": round(avg_rating, 2)}

# 📑 **9. Ordinare le recensioni di un singolo appunto**
@router.get("/notes/{note_id}/reviews-sorted", response_model=list[NoteRatingResponse])
def get_sorted_reviews(note_id: int, order: str = "desc", db: Session = Depends(get_db)):
    reviews_query = db.query(NoteRating).filter(NoteRating.note_id == note_id)

    if order.lower() == "asc":
        reviews_query = reviews_query.order_by(NoteRating.rating.asc())
    else:
        reviews_query = reviews_query.order_by(NoteRating.rating.desc())

    return reviews_query.all()

@router.post("/reports", response_model=ReportResponse)
def create_report(report: ReportCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Permette solo uno tra id_review e id_note
    if (report.id_review is None and report.id_note is None) or (report.id_review is not None and report.id_note is not None):
        raise HTTPException(status_code=400, detail="You must provide either id_review or id_note, but not both.")

    new_report = Report(
        id_review=report.id_review,
        id_note=report.id_note,
        id_user=current_user.id,
        reason=report.reason
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report


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

