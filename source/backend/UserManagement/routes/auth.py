from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db
from models.user import User
from schemas.user import UserCreate, UserResponse, UserLogin
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
auth_scheme = HTTPBearer()

# Configurazione JWT
SECRET_KEY = "a_very_secret_key"  # Cambia questa chiave con una più sicura!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Funzione per creare un token JWT
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=30)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Funzione per decodificare e verificare il token JWT
def verify_token(token: str, credentials_exception):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        return email
    except JWTError:
        raise credentials_exception

# Funzione per recuperare l'utente corrente
def get_current_user(db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = credentials.credentials
    email = verify_token(token, credentials_exception)
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return user

# API di registrazione
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

    # Convertiamo la data di nascita in formato datetime.date
    if isinstance(user.birth_date, str):
        user_birth_date = datetime.strptime(user.birth_date, "%Y-%m-%d").date()
    else:
        user_birth_date = user.birth_date

    # Crea il nuovo utente
    new_user = User (
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        birth_date=user_birth_date,  # Ora è un oggetto `date`
        city=user.city,
        is_admin=is_admin,
        faculty_id=-1
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Genera il token JWT per il nuovo utente
    access_token = create_access_token(data={"sub": new_user.email})

    # Restituisci l'utente e il token
    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        birth_date=new_user.birth_date,
        city=new_user.city,
        is_admin=new_user.is_admin,
        faculty_id=new_user.faculty_id,
        access_token=access_token,
        token_type="bearer"
    )

# API di login
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Controlla se la password è corretta
    if not pwd_context.verify(user.password, existing_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Genera JWT token
    access_token = create_access_token(data={"sub": existing_user.email})

    # Restituisce solo il token
    return {"access_token": access_token, "token_type": "bearer"}

# API di logout (invalida il token lato client)
@router.post("/logout")
def logout():
    """
    Simulazione del logout. Poiché JWT è stateless, lato backend non possiamo invalidare un token già generato.
    Il logout si gestisce lato frontend eliminando il token dallo storage del client.
    """
    return {"message": "Logout successful. Please delete the token on client-side."}


