from pydantic import BaseModel, field_validator
from datetime import date, datetime
from typing import Optional

class ReviewCreate(BaseModel):
    rating_clarity: int
    rating_feasibility: int
    rating_availability: int
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    created_at: date
    rating_clarity: int
    rating_feasibility: int
    rating_availability: int
    comment: Optional[str] = None

    @field_validator('created_at', mode='before')
    def convert_datetime_to_date(cls, value):
        if isinstance(value, datetime):
            return value.date()  # Estrae solo la parte data
        return value

    class Config:
        from_attributes = True  # Sostituisce `orm_mode = True` in Pydantic v2
