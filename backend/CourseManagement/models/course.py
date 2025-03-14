from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database.database import Base
# Non importare direttamente Faculty e Teacher, ma farlo più tardi

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculties.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)

    # Relazioni vuote per ora
    faculty = None
    teacher = None
    reviews = None

# Importazioni delle classi dopo la definizione
from models.faculty import Faculty
from models.teacher import Teacher
from models.review import Review

# Ora che le classi sono definite, inizializza le relazioni
Course.faculty = relationship("Faculty", back_populates="courses")
Course.teacher = relationship("Teacher", back_populates="courses")  # Relazione con `Teacher`
Course.reviews = relationship("Review", back_populates="course", cascade="all, delete-orphan")

__table_args__ = (UniqueConstraint("name", "faculty_id", name="uq_course_name_faculty"),)  # Vincolo di unicità per il nome del corso