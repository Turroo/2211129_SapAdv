from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.user import User
from schemas.user import UserCreate, UserResponse
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from auth.auth import create_access_token


router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Verifica se l'utente esiste già
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Crea l'hash della password
    hashed_password = pwd_context.hash(user.password)

    # Se è il primo utente, lo facciamo admin
    is_admin = db.query(User).count() == 0 

    # Crea il nuovo utente
    new_user = User(email=user.email, hashed_password=hashed_password, is_admin=is_admin)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Genera il token JWT per il nuovo utente
    access_token = create_access_token(data={"sub": new_user.email})

    # Restituisci l'utente e il token
    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        is_admin=bool(new_user.is_admin),  # Assicura che sia Boolean
        access_token=access_token,
        token_type="bearer"
    )


@router.post("/login", response_model=UserResponse)
def login(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Check if the provided password matches the hashed password
    if not pwd_context.verify(user.password, existing_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Generate JWT token
    access_token = create_access_token(data={"sub": existing_user.email})

    # Return response including the user's details and the token
    return UserResponse(
        id=existing_user.id,
        email=existing_user.email,
        is_admin=bool(existing_user.is_admin),  #  Assicura che sia Boolean
        access_token=access_token,
        token_type="bearer"
    )

