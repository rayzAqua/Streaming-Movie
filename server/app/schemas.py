"""
    Create Schemas
"""

from typing import Optional, Text, List
from pydantic import BaseModel, EmailStr
from pydantic.types import conint
from datetime import datetime
from decimal import Decimal


# user
class Register(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


class Token(BaseModel):
    user_id: int
    token: str


class AccessTokenData(BaseModel):
    user_id: int


class EmailInput(BaseModel):
    email: EmailStr


class ConfirmCode(EmailInput):
    code: str


class ChangePassword(BaseModel):
    isCorrect: bool
    email: EmailStr
    new_password: str


class EditProfile(BaseModel):
    name: str


class EditPassword(BaseModel):
    curr_pass: str
    password: str


class ProfileOut(BaseModel):
    email: str
    name: str
    created_at: datetime

    class Config:
        orm_mode = True


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    isAdmin: bool
    verified: bool
    status: bool
    created_at: datetime

    class Config:
        orm_mode = True


# genre
class Genre(BaseModel):
    name: str


class GenreOut(Genre):
    id: int


# film
class FilmBase(BaseModel):
    title: str
    length: int
    poster: str
    production_year: int
    path: str
    description: Text
    price: int
    genre_id: int
    status: bool


class FilmStatus(BaseModel):
    status: bool


class FilmDetailOut(FilmBase):
    id: int
    genre: GenreOut
    add_at: datetime

    class Config:
        orm_mode = True


class Actor(BaseModel):
    name: str
    photo: str


class ActorOut(Actor):
    id: int


class Pricing(BaseModel):
    name: str
    price: Decimal
    days: Decimal
    status: bool


class PricingOut(Pricing):
    id: int


class UserFavoriteFilm(BaseModel):
    film_id: int


class PaymentForm(BaseModel):
    order_id: str
    order_type: str
    amount: int
    order_desc: str
    bank_code: Optional[int]
    language: Optional[str]
