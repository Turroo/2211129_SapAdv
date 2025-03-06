# Usa Python come immagine base
FROM python:3.11

# Imposta la directory di lavoro
WORKDIR /backend/FacultyManagement

# Copia i file di dipendenze
COPY requirements.txt .

# Installa le dipendenze
RUN pip install --no-cache-dir -r requirements.txt

# Copia il codice del microservizio
COPY . .

# Espone la porta dell'app
EXPOSE 8002

# Avvia il servizio Faculties
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
