from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NoteBase(BaseModel):
    course_id: int
    description: Optional[str] = None

class NoteCreate(NoteBase):
    pass

class NoteResponse(NoteBase):
    id: int
    student_id: int
    file_id: str
    created_at: datetime

    class Config:
        from_attributes = True
