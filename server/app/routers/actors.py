"""
Router actor
Author: jinnguyen0612
Email: hoangha0612.work@gmail.com
"""

from fastapi import (
    UploadFile,
    File,
    APIRouter,
    Depends,
    status,
    HTTPException,
    Response,
    Form,
)
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional, Text, List

from ..database import get_db
from .. import database, schemas, models, utils, oauth2

router = APIRouter(prefix="/actors", tags=["Actors"])


# POST
@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_actor(
    actor: schemas.Actor,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    new_actor = models.Actor(**actor.dict())
    db.add(new_actor)
    db.commit()
    db.refresh(new_actor)

    return {"msg": "Create success"}


# GET
@router.get("/getAll", response_model=List[schemas.ActorOut])
async def get_all_actors(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    actors = db.query(models.Actor).all()
    return actors


@router.get("/get/{actor_id}", response_model=schemas.Actor)
async def get_actor(
    actor_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    actor = db.query(models.Actor).filter(models.Actor.id == actor_id).first()
    if not actor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Actor does not exist"
        )
    return actor


@router.get("/getFromFilm/{film_id}", response_model=List[schemas.ActorOut])
def get_film_actors(film_id: int, db: Session = Depends(get_db)):
    film = db.query(models.Film).filter(models.Film.id == film_id).first()

    if not film:
        raise HTTPException(status_code=404, detail="Film not found")

    actors = (
        db.query(models.Actor)
        .join(models.Film_Actor, models.Actor.id == models.Film_Actor.actor_id)
        .filter(models.Film_Actor.film_id == film_id)
        .all()
    )

    return actors


# PUT
@router.put("/edit/{actor_id}")
async def updateActor(
    actor_id: int,
    editActor: schemas.Actor,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    actor_query = db.query(models.Actor).filter(models.Actor.id == actor_id)
    actor = actor_query.first()

    if actor == None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Actor does not exist"
        )

    actor_query.update(editActor.dict(), synchronize_session=False)  # type: ignore
    db.commit()

    return {"msg": "Edit actor success"}
