from sqlalchemy import Table, Column, Integer, ForeignKey
from database.database import Base

user_courses = Table(
    "user_courses",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("course_id", Integer, ForeignKey("courses.id"), primary_key=True),
)
