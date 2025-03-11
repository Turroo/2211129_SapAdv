from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    birth_date = Column(Date, nullable=False)
    city = Column(String, nullable=False)
    
    # Aggiunta della colonna faculty_id, senza relazione diretta
    faculty_id = Column(Integer, nullable=True)
