from fastapi.security import OAuth2PasswordBearer

# Crea uno schema per gestire l'autenticazione tramite token Bearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")