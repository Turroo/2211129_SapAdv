from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Connessione al database PostgreSQL
# Crea una sessione di database gestita con SQLAlchemy

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:admin@db/sapienza_advisor")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
