"""
Create Schemas
Author: Team 12
Email: hoangha0612.work@gmail.com
"""

from typing import Dict, Optional, Text, List
from pydantic import BaseModel, EmailStr
from pydantic.types import conint
from datetime import date, datetime
from decimal import Decimal


# user
class Register(BaseModel):
    email: EmailStr
    password: str
    lname: str
    fname: str
    birth_date: Optional[date]


class Token(BaseModel):
    user_id: int
    token: str


class AccessTokenData(BaseModel):
    user_id: int


class ResendEmail(BaseModel):
    email: EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    lname: str
    fname: str
    birth_date: Optional[date]


class EditProfile(BaseModel):
    lname: Optional[str]
    fname: Optional[str]
    birth_date: Optional[date]


class EditPassword(BaseModel):
    password: str


class ForgetPassword(BaseModel):
    email: EmailStr


class ConfirmCode(ForgetPassword):
    code: str


# Output for profile
class ProfileOut(BaseModel):
    email: str
    lname: str
    fname: str
    birth_date: Optional[date]
    created_at: datetime

    class Config:
        orm_mode = True


class UserOut(BaseModel):
    user_id: int
    email: EmailStr
    lname: str
    fname: str
    birth_date: Optional[date]
    isAdmin: bool
    verified: bool
    status: bool
    created_at: datetime

    class Config:
        orm_mode = True


# genre
class Genre(BaseModel):
    genre_name: str


class GenreOut(Genre):
    genre_id: int


# Film
class FilmBase(BaseModel):
    title: str
    length: int
    poster: str
    production_year: int
    path: str
    description: Text
    agelimit_id: int
    status: bool


class FilmDetailOut(FilmBase):
    film_id: int
    created_at: datetime

    class Config:
        orm_mode = True


# Genre of Movie
class FilmGenre(BaseModel):
    film_id: int
    genre_id: int


class Actor(BaseModel):
    name: str
    photo: str


class ActorOut(Actor):
    id: int


class Package(BaseModel):
    package_name: str
    duration: int


class Price(BaseModel):
    price: float


class PackagePrice(BaseModel):
    price_id: int
    start_at: datetime
    end_at: datetime


class EditPackagePrice(BaseModel):
    price_id: Optional[int]
    start_at: Optional[datetime]
    end_at: Optional[datetime]


class PackageOut(Package):
    id: int


class UserFavoriteFilm(BaseModel):
    film_id: int
