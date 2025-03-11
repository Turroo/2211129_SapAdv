from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database.database import Base

from models.teacher import Teacher  # Importa Teacher prima


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculties.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)  # Aggiunta FK per il docente

    faculty = relationship("Faculty", back_populates="courses")
    teacher = relationship("Teacher", back_populates="courses")  # Relazione con `Teacher`
