"""
Create Schemas
Author: jinnguyen0612
Email: hoangha0612.work@gmail.com
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
    role: int


class EditProfile(BaseModel):
    name: str


class EditPassword(BaseModel):
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
    role: int
    created_at: datetime
    status: int

    class Config:
        orm_mode = True


# token
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    id: Optional[str] = None


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
