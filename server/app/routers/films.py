"""
    Router films
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
from sqlalchemy.sql import text
from sqlalchemy import func
from sqlalchemy import desc


from ..database import get_db
from .. import database, schemas, models, utils, oauth2

router = APIRouter(prefix="/films", tags=["Films"])


# POST
@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_film(
    film: schemas.FilmBase,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    film_check = db.query(models.Film).filter(models.Film.title == film.title).first()
    if film_check:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Film title conflict"
        )
    new_film = models.Film(**film.dict())
    db.add(new_film)
    db.commit()
    db.refresh(new_film)
    return {"msg": "Create success"}


@router.post("/addActors/{film_id}/{actor_id}", status_code=status.HTTP_201_CREATED)
def add_actor_to_film(
    film_id: int,
    actor_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    film = db.query(models.Film).get(film_id)

    if not film:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Film not found"
        )

    actor = db.query(models.Actor).get(actor_id)
    if not actor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Actor with id {actor_id} not found",
        )

    film_actor = models.Film_Actor(film_id=film_id, actor_id=actor_id)
    db.add(film_actor)

    db.commit()
    db.refresh(film)

    return {"msg": "Add actor to film success"}


@router.post("/addFavoriteFilm/{film_id}", status_code=status.HTTP_201_CREATED)
def add_favorite_film(
    film_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    film = db.query(models.Film).get(film_id)
    if not film:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Film not found"
        )
    checkFavorite = (
        db.query(models.Favorite_Film)
        .filter(
            models.Favorite_Film.film_id == film_id,
            models.Favorite_Film.user_id == current_user.id,
        )
        .first()
    )
    if checkFavorite:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Film had been added"
        )

    favorite_film = models.Favorite_Film(user_id=current_user.id, film_id=film_id)
    db.add(favorite_film)
    db.commit()

    return {"msg": "Film added to favorites"}


@router.post("/addTimeStamp/{film_id}", status_code=status.HTTP_201_CREATED)
def add_time_film(
    film_id: int,
    time: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    film = db.query(models.Film).get(film_id)
    if not film:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Film not found"
        )
    checkTime = (
        db.query(models.Stamping_Film)
        .filter(
            models.Stamping_Film.film_id == film_id,
            models.Stamping_Film.user_id == current_user.id,
        )
        .first()
    )
    if checkTime:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Film had been added"
        )

    if time < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid timestamp value"
        )

    time_stamp = models.Stamping_Film(
        user_id=current_user.id, film_id=film_id, time_stamping=time
    )
    db.add(time_stamp)
    db.commit()

    return {"msg": "TimeStamp added to favorites"}


@router.post("/addVote/{film_id}", status_code=status.HTTP_201_CREATED)
def vote_film(
    film_id: int,
    vote: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    film = db.query(models.Film).get(film_id)
    if not film:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Film not found"
        )

    # Assuming vote should be between 1 and 5
    if vote < 1 or vote > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid vote value"
        )

    film_vote = models.Rating_Film(user_id=current_user.id, film_id=film_id, rate=vote)
    db.add(film_vote)
    db.commit()

    return {"msg": "Film voted successfully"}


# END POST


# GET
@router.get("/getAll", response_model=List[schemas.FilmDetailOut])
async def get_all_films(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    films = db.query(models.Film).all()
    film_details = []
    for film in films:
        film_detail = schemas.FilmDetailOut(
            **film.__dict__,
            genre=schemas.GenreOut(
                **film.genre.__dict__
            ),  # Chắc chắn cung cấp giá trị cho trường genre
        )
        film_details.append(film_detail)
    return film_details


@router.get("/getActive", response_model=List[schemas.FilmDetailOut])
async def get_active_films(db: Session = Depends(get_db)):
    films = db.query(models.Film).filter(models.Film.status == True).all()
    return films


@router.get("/getLatestActive", response_model=List[schemas.FilmDetailOut])
async def get_latest_active_films(db: Session = Depends(get_db)):
    films = (
        db.query(models.Film)
        .filter(models.Film.status == True)
        .order_by(models.Film.add_at.desc())
        .limit(5)
        .all()
    )
    film_details = []
    for film in films:
        film_detail = schemas.FilmDetailOut(
            **film.__dict__, genre=schemas.GenreOut(**film.genre.__dict__)
        )
        film_details.append(film_detail)
    return film_details


@router.get("/get/{film_id}", response_model=schemas.FilmDetailOut)
async def get_film(
    film_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    film = db.query(models.Film).filter(models.Film.id == film_id).first()
    if not film:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Film does not exist"
        )
    return film


@router.get("/getFilm/{film_title}", response_model=schemas.FilmDetailOut)
async def get_film(film_title: str, db: Session = Depends(get_db)):
    film = db.query(models.Film).filter(models.Film.title == film_title).first()
    if not film:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Film does not exist"
        )
    return film

@router.get('/search', response_model=List[schemas.FilmDetailOut])
async def get_film(db: Session = Depends(get_db), search: Optional[str] = None, genre: Optional[int] = None, rate: Optional[int] = None, year: Optional[int] = None):

    films = db.query(models.Film)
    rating_subquery = db.query(
        models.Rating_Film.film_id,
        func.avg(models.Rating_Film.rate).label("avg_rating")
    ).group_by(models.Rating_Film.film_id).subquery()

    films = films.outerjoin(rating_subquery, rating_subquery.c.film_id == models.Film.id)
    films = films.filter(models.Film.status == True)

    if search:
        films = films.filter(models.Film.title.ilike(f"%{search}%"))

    if rate is not None:
        films = films.filter(rating_subquery.c.avg_rating >= rate)

    if year is not None:
        films = films.filter(models.Film.production_year == year)

    if genre is not None:
        films = films.filter(models.Film.genre_id == genre)

    found_films = films.all()

    return found_films


@router.get("/topFavoriteFilms", response_model=List[schemas.FilmDetailOut])
def get_top_favorite_films(db: Session = Depends(get_db)):
    subquery = (
        db.query(
            models.Favorite_Film.film_id,
            func.count(models.Favorite_Film.film_id).label("count"),
        )
        .group_by(models.Favorite_Film.film_id)
        .order_by(text("count DESC"))
        .limit(8)
        .subquery()
    )

    top_favorite_films = (
        db.query(models.Film).join(subquery, models.Film.id == subquery.c.film_id).all()
    )

    return top_favorite_films


@router.get("/topRatedFilms", response_model=list[dict])
async def get_top_rated_films(db: Session = Depends(get_db)):
    top_rated_films = (
        db.query(
            models.Film,
            func.avg(models.Rating_Film.rate).label("avg_rating"),
            func.count(models.Rating_Film.film_id).label("vote_count"),
        )
        .join(models.Rating_Film, models.Film.id == models.Rating_Film.film_id)
        .group_by(models.Film.id)
        .order_by(desc("avg_rating"), desc("vote_count"))
        .limit(8)
        .all()
    )

    film_list_with_avg_rating = []
    for film, avg_rating, vote_count in top_rated_films:
        genre_name = film.genre.name if film.genre else None
        film_data = {
            "id": film.id,
            "title": film.title,
            "length": film.length,
            "poster": film.poster,
            "production_year": film.production_year,
            "path": film.path,
            "description": film.description,
            "price": film.price,
            "genre": {"name": genre_name, "id": film.genre_id},
            "status": film.status,
            "add_at": film.add_at,
            "avg_rating": avg_rating,
            "vote_count": vote_count,
        }
        film_list_with_avg_rating.append(film_data)

    return film_list_with_avg_rating


@router.get("/averageRating/{film_id}")
def get_average_rating(film_id: int, db: Session = Depends(get_db)):
    avg_rating = (
        db.query(func.avg(models.Rating_Film.rate).label("avg_rating"))
        .filter(models.Rating_Film.film_id == film_id)
        .scalar()
    )

    if avg_rating is None:
        avg_rating = 0.0

    return {"film_id": film_id, "average_rating": avg_rating}


@router.get("/getFavoriteFilms", response_model=List[schemas.FilmDetailOut])
def get_favorite_films(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    favorite_films = (
        db.query(models.Film)
        .join(models.Favorite_Film, models.Film.id == models.Favorite_Film.film_id)
        .filter(models.Favorite_Film.user_id == current_user.id)
        .all()
    )

    if not favorite_films:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User has no favorite films"
        )
    return favorite_films


@router.get("/checkVote/{film_id}")
def check_vote(
    film_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    voteFilm = (
        db.query(models.Rating_Film)
        .filter(
            models.Rating_Film.film_id == film_id,
            models.Rating_Film.user_id == current_user.id,
        )
        .first()
    )
    if voteFilm:
        return {"value": True}
    else:
        return {"value": False}


@router.get("/checkTime/{film_id}")
def check_time(
    film_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    timeFilm = (
        db.query(models.Stamping_Film)
        .filter(
            models.Stamping_Film.film_id == film_id,
            models.Stamping_Film.user_id == current_user.id,
        )
        .first()
    )
    if timeFilm:
        return {"value": True, "time": timeFilm.time_stamping}
    else:
        return {"value": False}


# END GET


# PUT
@router.put("/edit/{film_id}")
async def update_film(
    film_id: int,
    edit_film: schemas.FilmBase,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    try:
        film_check = (
            db.query(models.Film).filter(models.Film.title == edit_film.title).first()
        )
        if (film_check) and (film_check.id != film_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Film title conflict"
            )
        film_query = db.query(models.Film).filter(models.Film.id == film_id)
        film = film_query.first()

        if film == None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=f"Film does not exist"
            )

        film_query.update(edit_film.dict(), synchronize_session=False)  # type: ignore
        db.commit()
        return {"msg": "Edit film success"}
    except Exception as e:
        error_detail = str(e)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=error_detail
        )


@router.put("/edit/status/{film_id}")
async def update_film_status(
    film_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    film_query = db.query(models.Film).filter(models.Film.id == film_id)
    film = film_query.first()

    if film is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Film does not exist"
        )

    new_status = not film.status
    edit_film = {"status": new_status}

    film_query.update(edit_film, synchronize_session=False)
    db.commit()
    return {"msg": "Change film status success"}


@router.put("/editVote/{film_id}", status_code=status.HTTP_200_OK)
def edit_vote_film(
    film_id: int,
    vote: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    voteFilm_query = db.query(models.Rating_Film).filter(
        models.Rating_Film.film_id == film_id,
        models.Rating_Film.user_id == current_user.id,
    )
    voteFilm = voteFilm_query.first()
    if voteFilm is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Vote does not exist"
        )

    # Assuming vote should be between 1 and 5
    if vote < 1 or vote > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid vote value"
        )

    editVote = {"rate": vote}
    voteFilm_query.update(editVote, synchronize_session=False)
    db.commit()

    return {"msg": "Change vote successfully"}


@router.put("/editTimeStamp/{film_id}", status_code=status.HTTP_200_OK)
def edit_time(
    film_id: int,
    time: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    timeStamp_query = db.query(models.Stamping_Film).filter(
        models.Stamping_Film.film_id == film_id,
        models.Stamping_Film.user_id == current_user.id,
    )
    timeStamp = timeStamp_query.first()
    if timeStamp is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="TimeStamp does not exist"
        )

    # Assuming vote should be between 1 and 5
    if time < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid value"
        )

    editTime = {"time_stamping": time}
    timeStamp_query.update(editTime, synchronize_session=False)
    db.commit()

    return {"msg": "Change time successfully"}


# END PUT


# DELETE
@router.delete(
    "/deleteActor/{film_id}/{actor_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_actor(
    film_id: int,
    actor_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    film = db.query(models.Film).get(film_id)

    if not film:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Film not found"
        )

    actor = db.query(models.Actor).get(actor_id)
    if not actor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Actor not found"
        )

    # Assuming you have a relationship between films and actors
    film_actor_query = db.query(models.Film_Actor).filter(
        models.Film_Actor.film_id == film_id, models.Film_Actor.actor_id == actor_id
    )
    film_actor = film_actor_query.first()
    if not film_actor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Film_Actor not found"
        )

    film_actor_query.delete(synchronize_session=False)

    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/deleteFavoriteFilm/{film_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_favorite_film(
    film_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    film = db.query(models.Film).get(film_id)

    if not film:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Film not found"
        )

    # Assuming you have a relationship between films and actors
    favorite_query = db.query(models.Favorite_Film).filter(
        models.Favorite_Film.film_id == film_id,
        models.Favorite_Film.user_id == current_user.id,
    )
    favorite = favorite_query.first()
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Favorite not found"
        )

    favorite_query.delete(synchronize_session=False)

    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/deleteAllFavorite", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_favorite(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    # Assuming you have a relationship between films and actors
    favorite_query = db.query(models.Favorite_Film).filter(
        models.Favorite_Film.user_id == current_user.id
    )
    favorite_query.delete(synchronize_session=False)

    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


# END DELETE
