from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from database.database import get_db
from passlib.context import CryptContext
from models.user import User
from schemas.user import UserUpdate
from auth.auth import get_current_user

router = APIRouter()

# Configurazione di Passlib per l'hashing delle password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# API per aggiornare i dettagli dell'utente (no email/password)
@router.put("/update", response_model=UserUpdate)
def update_user_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ Permette all'utente autenticato di aggiornare il proprio profilo, senza cambiare email o password. """
    db_user = db.query(User).filter(User.id == current_user.id).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_update.dict(exclude_unset=True)

    # Blocca la modifica di email e password
    if "email" in update_data:
        update_data.pop("email")

    if "password" in update_data:
        update_data.pop("password")

    if "faculty_id" in update_data:
        update_data.pop("faculty_id")

    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    
    return db_user
def reset_sequence(db: Session, table_name: str, column_name: str):
    """ Reset the sequence to the max ID in the table. """
    db.execute(text(f"""
        SELECT setval(pg_get_serial_sequence('{table_name}', '{column_name}'), 
                      COALESCE((SELECT MAX({column_name}) FROM {table_name}) + 1, 1), false)
    """))
    db.commit()



# API per cambiare la password di un utente
@router.put("/update-password")
def update_password(
    old_password: str,  # ✅ Richiede la vecchia password
    new_password: str,  # ✅ E la nuova password
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ Permette all'utente autenticato di cambiare la propria password SOLO se fornisce quella vecchia. """
    db_user = db.query(User).filter(User.id == current_user.id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # 🔹 Verifica che la vecchia password sia corretta
    if not pwd_context.verify(old_password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Old password is incorrect")

    # 🔹 Aggiorna la password con l'hash della nuova
    db_user.hashed_password = pwd_context.hash(new_password)

    db.commit()
    db.refresh(db_user)

    return {"message": "Password updated successfully"}

#  API per eliminare completamente un utente
@router.delete("/delete")
def delete_user(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ Deletes the user and resets the sequence. """

    db_user = db.query(User).filter(User.id == current_user.id).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()
    
    # Reset sequence after deletion
    reset_sequence(db, "users", "id")

    return {"message": "User account deleted successfully"}

