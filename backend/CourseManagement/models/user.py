from sqlalchemy import Column, Integer, String, Boolean
from database.database import Base
from sqlalchemy.orm import relationship  # Add this import
from models.user_course import user_courses


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)
    # Se un utente può iscriversi a più corsi, aggiungi questa relazione
    courses = relationship("Course", secondary="user_courses", back_populates="users")