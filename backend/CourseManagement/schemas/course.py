from pydantic import BaseModel
from typing import Optional

# Definisce la tabella courses con id, name, description, faculty_id
# Crea una relazione molti-a-molti tra studenti e corsi per la gestione di recensioni e valutazioni
# Definisce la relazione con la tabella faculties

# Schema per la creazione di un nuovo corso
class CourseCreate(BaseModel):
    name: str
    description: str
    faculty_id: int

# Schema per la risposta di un corso
class CourseResponse(BaseModel):
    id: int
    name: str
    description: str
    faculty_id: int
    average_rating: Optional[float] = 0.0  # Campo per la media delle review

    class Config:
        from_attributes = True

# Schema per recensioni e valutazioni dei corsi
class CourseReview(BaseModel):
    course_id: int
    rating: float
    review: Optional[str]

    class Config:
        from_attributes = True

