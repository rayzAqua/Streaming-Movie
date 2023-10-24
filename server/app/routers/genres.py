"""
    Router Genre
"""

from fastapi import APIRouter, Depends, status, HTTPException, Response
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from typing import Optional, Text, List

from .. import database, schemas, models, utils, oauth2

router = APIRouter(prefix="/genres", tags=["Genres"])


# POST
@router.post(
    "/create", status_code=status.HTTP_201_CREATED, response_model=schemas.GenreOut
)
async def create_genre(
    genre: schemas.Genre,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    new_genre = models.Genre(**genre.dict())
    db.add(new_genre)
    db.commit()
    db.refresh(new_genre)
    return new_genre


# GET
@router.get("/getAll", response_model=List[schemas.GenreOut])
async def get_all_genres(db: Session = Depends(get_db)):
    genres = db.query(models.Genre).all()

    return genres


@router.get("/getAllForSearch")
async def allGenres(db: Session = Depends(get_db)):
    genres = db.query(models.Genre).all()

    data = [{"title": genre.name, "value": genre.id} for genre in genres]

    return data


@router.get("/get/{genre_id}", response_model=schemas.GenreOut)
async def get_genre(genre_id: int, db: Session = Depends(get_db)):
    genre = db.query(models.Genre).filter(models.Genre.id == genre_id).first()
    if not genre:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Genre does not exist"
        )
    return genre


# PUT
@router.put("/edit/{genre_id}")
async def update_genre(
    genre_id: int,
    edit_genre: schemas.Genre,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    genre_query = db.query(models.Genre).filter(models.Genre.id == genre_id)
    genre = genre_query.first()

    if genre == None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Genre does not exist"
        )

    genre_query.update(edit_genre.dict(), synchronize_session=False)  # type: ignore
    db.commit()

    return {"msg": "Edit Genre success"}
