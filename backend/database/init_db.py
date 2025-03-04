from backend.database.database import Base, engine
from backend.models.user import User

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")
