from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    birth_date: date  # Cambiato da string a date
    city: str

# Schema per il login dell'utente (solo email e password)
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[date] = None
    city: Optional[str] = None
    faculty_id: Optional[int] = None

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    birth_date: date  # Ora restituisce una data reale
    city: str
    is_admin: bool
    faculty_id : int = None
    access_token: str
    token_type: str

    class Config:
        from_attributes = True
