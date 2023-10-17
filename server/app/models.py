"""
    Create table PostgreSQL
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql.expression import text
from sqlalchemy.sql.sqltypes import TIMESTAMP

from .database import Base


class Token(Base):
    __tablename__ = "token"
    token_id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(
        Integer,
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    token = Column(String, nullable=False, unique=True)


class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
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

    payment = relationship("Payment", back_populates="user")
    favorite_film = relationship("Favorite_Film", back_populates="user")
    rated_film = relationship("Rating_Film", back_populates="user")
    stamped_film = relationship("Stamping_Film", back_populates="user")


class Film(Base):
    __tablename__ = "film"
    id = Column(Integer, primary_key=True, nullable=False)
    title = Column(String, nullable=False, unique=True)
    length = Column(Integer, nullable=False)  # minute
    poster = Column(String, nullable=False)
    production_year = Column(Integer, nullable=False)
    path = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Integer, nullable=False)
    genre_id = Column(
        Integer, ForeignKey("genre.id", ondelete="CASCADE"), nullable=False
    )
    status = Column(
        Boolean, nullable=False, server_default="True"
    )  # True: kich hoat, False: vo hieu hoa
    add_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )

    genre = relationship("Genre", back_populates="film")
    actors = relationship("Film_Actor", back_populates="film")
    payment = relationship("Payment", back_populates="film")


#
class Genre(Base):
    __tablename__ = "genre"
    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String, nullable=False)

    film = relationship("Film", back_populates="genre")


class Actor(Base):
    __tablename__ = "actors"
    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String, nullable=False)
    photo = Column(String, nullable=False)

    film = relationship("Film_Actor", back_populates="actor")


class Pricing(Base):
    __tablename__ = "pricing"
    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String, nullable=False)
    price = Column(Numeric, nullable=False)
    days = Column(Numeric, nullable=False)
    status = Column(
        Boolean, nullable=False, server_default="True"
    )  # True: kich hoat, False: vo hieu hoa

    payment = relationship("Payment", back_populates="pricing")


# Payment of a user
class Payment(Base):
    __tablename__ = "payment"
    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    pricing_id = Column(
        Integer, ForeignKey("pricing.id", ondelete="CASCADE"), nullable=True
    )
    film_id = Column(Integer, ForeignKey("film.id", ondelete="CASCADE"), nullable=True)
    pay = Column(Integer, nullable=False)
    status = Column(Integer, nullable=False)
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )
    end_date = Column(TIMESTAMP(timezone=True), nullable=False)

    user = relationship("User", back_populates="payment")
    film = relationship("Film", back_populates="payment")
    pricing = relationship("Pricing", back_populates="payment")


# Table Favorite film/serie
class Favorite_Film(Base):
    __tablename__ = "favorite_film"
    user_id = Column(
        Integer, ForeignKey("user.id", ondelete="CASCADE"), primary_key=True
    )
    film_id = Column(
        Integer, ForeignKey("film.id", ondelete="CASCADE"), primary_key=True
    )

    user = relationship("User", back_populates="favorite_film")


# Table rating film/serie
class Rating_Film(Base):
    __tablename__ = "rating_film"
    user_id = Column(
        Integer, ForeignKey("user.id", ondelete="CASCADE"), primary_key=True
    )
    film_id = Column(
        Integer, ForeignKey("film.id", ondelete="CASCADE"), primary_key=True
    )
    rate = Column(Numeric, nullable=False)

    user = relationship("User", back_populates="rated_film")


# Table time stamping
class Stamping_Film(Base):
    __tablename__ = "stamping"
    user_id = Column(
        Integer, ForeignKey("user.id", ondelete="CASCADE"), primary_key=True
    )
    film_id = Column(
        Integer, ForeignKey("film.id", ondelete="CASCADE"), primary_key=True
    )
    time_stamping = Column(Numeric, nullable=False)

    user = relationship("User", back_populates="stamped_film")


# Table actor in film/serie
class Film_Actor(Base):
    __tablename__ = "film_actor"
    actor_id = Column(
        Integer, ForeignKey("actors.id", ondelete="CASCADE"), primary_key=True
    )
    film_id = Column(
        Integer, ForeignKey("film.id", ondelete="CASCADE"), primary_key=True
    )

    actor = relationship("Actor", back_populates="film")
    film = relationship("Film", back_populates="actors")
