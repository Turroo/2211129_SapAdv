# Usa Python come immagine base
FROM python:3.11

# Imposta la working directory all'interno del container
WORKDIR /backend

# Copia il file delle dipendenze e installa i pacchetti
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia tutto il codice del backend
COPY . .

# Esponi la porta su cui FastAPI girerà
EXPOSE 8000

# Comando per avviare il server FastAPI
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port 8000"]

