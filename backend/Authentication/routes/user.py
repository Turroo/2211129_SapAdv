from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.user import User
from schemas.user import UserUpdate
from auth.auth import get_current_user  # Funzione per autenticazione
from passlib.context import CryptContext

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.get("/me", response_model=UserUpdate)
def read_user_profile(current_user: User = Depends(get_current_user)):
    """ Recupera i dati del profilo dell'utente autenticato. """
    return current_user

@router.put("/me", response_model=UserUpdate)
def update_user_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ Permette all'utente autenticato di aggiornare il proprio profilo. """
    db_user = db.query(User).filter(User.id == current_user.id).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_update.dict(exclude_unset=True)

    # Se l'utente sta aggiornando la password, hashala prima di salvarla
    if "password" in update_data:
        update_data["hashed_password"] = pwd_context.hash(update_data.pop("password"))

    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    
    return db_user

