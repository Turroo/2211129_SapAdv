from sqlalchemy import Column, Integer, String, ForeignKey, Float, Table
from sqlalchemy.orm import relationship
from database.database import Base
from models.faculty import Faculty
from models.user_course import user_courses

# CourseCreate: validazione per la creazione di un corso
# CourseResponse: struttura della risposta di un corso
# CourseReview: validazione per recensioni e valutazioni

# Tabella per relazioni molti-a-molti tra studenti e corsi (recensioni e valutazioni)
student_course_review = Table(
    "student_course_review",
    Base.metadata,
    Column("student_id", Integer, ForeignKey("users.id")),
    Column("course_id", Integer, ForeignKey("courses.id")),
    Column("rating", Float),
    Column("review", String, nullable=True)
)

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    faculty_id = Column(Integer, ForeignKey("faculties.id"), nullable=False)

    faculty = relationship("Faculty", back_populates="courses")
    users = relationship("User", secondary="user_courses", back_populates="courses")



