"""
Create table PostgreSQL
Author: Team 12
Email: hoangha0612.work@gmail.com
"""

from sqlalchemy import Column, Date, Integer, String, Boolean, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql.expression import text
from sqlalchemy.sql.sqltypes import TIMESTAMP

from .database import Base


# Table User
class User(Base):
    __tablename__ = "user"
    user_id = Column(Integer, primary_key=True, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    lname = Column(String, nullable=False)
    fname = Column(String, nullable=False)
    birth_date = Column(Date)  # Đặt kiểu dữ liệu là Date
    isAdmin = Column(
        Boolean, nullable=False, server_default="False"
    )  # True: Admin, False: Customer
    verified = Column(Boolean, nullable=False, server_default="False")
    status = Column(
        Boolean, nullable=False, server_default="True"
    )  # True: Hoạt động, False: Vô hiệu hoá
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )

    subcription = relationship("Subcription", back_populates="user_subcription")
    favorite_film = relationship("Favorite_Film", back_populates="user_favorite")
    rating_film = relationship("Rating_Film", back_populates="user_rating")
    history = relationship("History", back_populates="user_history")


# Table Film
class Film(Base):
    __tablename__ = "film"
    film_id = Column(Integer, primary_key=True, nullable=False)
    title = Column(String, nullable=False, unique=True)
    length = Column(Integer, nullable=False)  # minute
    poster = Column(String, nullable=False)
    production_year = Column(Integer, nullable=False)
    path = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    age_limit = Column(
        Integer, ForeignKey("age_limit.agelimit_id", ondelete="CASCADE"), nullable=False
    )
    status = Column(
        Boolean, nullable=False, server_default="True"
    )  # True: kich hoat, False: vo hieu hoa
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )

    genres = relationship("Film_Genre", back_populates="film")
    actors = relationship("Film_Actor", back_populates="film")
    agelimit = relationship("Age_Limit", back_populates="film")
    subcription = relationship("Subcription", back_populates="film")
    favorite = relationship("Favorite_Film", back_populates="film")
    rating = relationship("Rating_Film", back_populates="film")
    history = relationship("History", back_populates="film")
    price = relationship("Film_Price", back_populates="film")


# Table for genre
class Genre(Base):
    __tablename__ = "genre"
    genre_id = Column(Integer, primary_key=True, nullable=False)
    genre_name = Column(String, nullable=False)

    films = relationship("Film_Genre", back_populates="genre")


# Table for actor
class Actor(Base):
    __tablename__ = "actors"
    actor_id = Column(Integer, primary_key=True, nullable=False)
    lname = Column(String, nullable=False)
    fname = Column(String, nullable=False)
    photo = Column(String, nullable=False)

    films = relationship("Film_Actor", back_populates="actor")


# Table for age limit
class Age_Limit(Base):
    __tablename__ = "age_limit"
    agelimit_id = Column(Integer, primary_key=True, nullable=False)
    age = Column(Integer, nullable=False)

    film = relationship("Film", back_populates="agelimit")


# Table actor in film/serie
class Film_Actor(Base):
    __tablename__ = "film_actor"
    fa_id = Column(Integer, primary_key=True, nullable=False)
    actor_id = Column(
        Integer, ForeignKey("actors.actor_id", ondelete="CASCADE"), nullable=False
    )
    film_id = Column(
        Integer, ForeignKey("film.film_id", ondelete="CASCADE"), nullable=False
    )

    actor = relationship("Actor", back_populates="films")
    film = relationship("Film", back_populates="actors")


class Subcription_Package(Base):
    __tablename__ = "subcription_package"
    package_id = Column(Integer, primary_key=True, nullable=False)
    package_name = Column(String, nullable=False)
    duration = Column(Numeric, nullable=False)
    status = Column(
        Boolean, nullable=False, server_default="True"
    )  # True: kich hoat, False: vo hieu hoa

    subcription = relationship("Subcription", back_populates="package")
    price = relationship("Package_Price", back_populates="package")


# Payment of a user
class Subcription(Base):
    __tablename__ = "subcription"
    payment_id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(
        Integer, ForeignKey("user.user_id", ondelete="CASCADE"), nullable=False
    )
    package_id = Column(
        Integer,
        ForeignKey("subcription_package.package_id", ondelete="CASCADE"),
        nullable=True,
    )
    film_id = Column(
        Integer, ForeignKey("film.film_id", ondelete="CASCADE"), nullable=True
    )
    status = Column(
        Boolean, nullable=False, server_default="False"
    )  # True: Thanh toán thành công, False: Chưa thanh toán
    start_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )
    end_at = Column(TIMESTAMP(timezone=True), nullable=False)

    user_subcription = relationship("User", back_populates="subcription")
    film = relationship("Film", back_populates="subcription")
    package = relationship("Subcription_Package", back_populates="subcription")


# Table genre of film
class Film_Genre(Base):
    __tablename__ = "film_genre"
    fg_id = Column(Integer, primary_key=True, nullable=False)
    film_id = Column(
        Integer, ForeignKey("film.film_id", ondelete="CASCADE"), nullable=False
    )
    genre_id = Column(
        Integer, ForeignKey("genre.genre_id", ondelete="CASCADE"), nullable=False
    )

    film = relationship("Film", back_populates="genres")
    genre = relationship("Genre", back_populates="films")


# Table Favorite film/serie
class Favorite_Film(Base):
    __tablename__ = "favorite_film"
    favorite_id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(
        Integer, ForeignKey("user.user_id", ondelete="CASCADE"), nullable=False
    )
    film_id = Column(
        Integer, ForeignKey("film.film_id", ondelete="CASCADE"), nullable=False
    )

    user_favorite = relationship("User", back_populates="favorite_film")
    film = relationship("Film", back_populates="favorite")


# Table rating film/serie
class Rating_Film(Base):
    __tablename__ = "rating_film"
    rating_id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(
        Integer, ForeignKey("user.user_id", ondelete="CASCADE"), nullable=False
    )
    film_id = Column(
        Integer, ForeignKey("film.film_id", ondelete="CASCADE"), nullable=False
    )
    rate = Column(Numeric, nullable=False)

    user_rating = relationship("User", back_populates="rating_film")
    film = relationship("Film", back_populates="rating")


# Table time stamping
class History(Base):
    __tablename__ = "history"
    history_id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(
        Integer, ForeignKey("user.user_id", ondelete="CASCADE"), nullable=False
    )
    film_id = Column(
        Integer, ForeignKey("film.film_id", ondelete="CASCADE"), nullable=False
    )
    time_stamping = Column(Numeric, nullable=False)
    watch_date = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )

    user_history = relationship("User", back_populates="history")
    film = relationship("Film", back_populates="history")


# Table for price
class Price_List(Base):
    __tablename__ = "price_list"
    price_id = Column(Integer, primary_key=True, nullable=False)
    price = Column(Numeric, nullable=False)
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )

    package = relationship("Package_Price", back_populates="price_list")
    film = relationship("Film_Price", back_populates="price_list")


# Table price for package
class Package_Price(Base):
    __tablename__ = "package_price"
    pp_id = Column(Integer, primary_key=True, nullable=False)
    price_id = Column(
        Integer, ForeignKey("price_list.price_id", ondelete="CASCADE"), nullable=False
    )
    package_id = Column(
        Integer,
        ForeignKey("subcription_package.package_id", ondelete="CASCADE"),
        nullable=False,
    )
    start_at = Column(TIMESTAMP(timezone=True))
    end_at = Column(TIMESTAMP(timezone=True))

    price_list = relationship("Price_List", back_populates="package")
    package = relationship("Subcription_Package", back_populates="price")


# Table price for film
class Film_Price(Base):
    __tablename__ = "film_price"
    fp_id = Column(Integer, primary_key=True, nullable=False)
    price_id = Column(
        Integer, ForeignKey("price_list.price_id", ondelete="CASCADE"), nullable=False
    )
    film_id = Column(
        Integer, ForeignKey("film.film_id", ondelete="CASCADE"), nullable=False
    )
    start_at = Column(TIMESTAMP(timezone=True))
    end_at = Column(TIMESTAMP(timezone=True))

    price_list = relationship("Price_List", back_populates="film")
    film = relationship("Film", back_populates="price")


class Token(Base):
    __tablename__ = "token"
    token_id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(
        Integer,
        ForeignKey("user.user_id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    token = Column(String, nullable=False, unique=True)
