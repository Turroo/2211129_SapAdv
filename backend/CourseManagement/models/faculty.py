from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database.database import Base


class Faculty(Base):
    __tablename__ = "faculties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    courses = relationship("Course", back_populates="faculty", cascade="all, delete-orphan")
