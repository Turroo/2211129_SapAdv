from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from database.database import Base

# Tabella di associazione tra Teacher e Course (relazione molti-a-molti)
teacher_course_association = Table(
    "teacher_course_association",
    Base.metadata,
    Column("teacher_id", Integer, ForeignKey("teachers.id")),
    Column("course_id", Integer, ForeignKey("courses.id")),
    extend_existing=True
)

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    courses = relationship("Course", secondary=teacher_course_association, back_populates="teachers")
