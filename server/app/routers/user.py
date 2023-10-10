"""
Router User
Author: jinnguyen0612
Email: hoangha0612.work@gmail.com
"""

from fastapi import APIRouter, Depends, status, HTTPException, Response
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import schemas, models, utils, oauth2

router = APIRouter(prefix="/user", tags=["User"])


# POST
@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    check_user = db.query(models.User).filter(models.User.email == user.email).first()
    if check_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already exists"
        )
    hashed_password = utils.hash(user.password)
    user.password = hashed_password
    new_user = models.User(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"msg": "Create success"}


# GET
@router.get("/getAll", response_model=List[schemas.UserOut])
async def get_all_users(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    users = db.query(models.User).all()
    return users


@router.get("/get/{id}", response_model=List[schemas.UserOut])
async def get_user(
    id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    user = db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist"
        )
    return user


@router.get("/getCustomer", response_model=List[schemas.UserOut])
async def get_all_customer(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    customer = db.query(models.User).filter(models.User.role == 1).all()
    return customer


@router.get("/getFavoriteMovie", response_model=List[schemas.UserFavoriteFilm])
async def get_favorite_movie(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    film = (
        db.query(models.Favorite_Film)
        .filter(models.Favorite_Film.user_id == current_user.id)
        .all()
    )
    return film


@router.get("/profile", response_model=schemas.ProfileOut)
async def get_profile(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist"
        )
    return user


# END GET


# PUT
@router.put("/editProfile")
async def update_profile(
    edit_user: schemas.EditProfile,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    user_query = db.query(models.User).filter(models.User.id == current_user.id)
    user = user_query.first()

    if user == None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"User does not exist"
        )

    user_query.update(edit_user.dict(), synchronize_session=False)  # type: ignore
    db.commit()

    return {"msg": "Edit profile success"}


@router.put("/changePass")
async def change_pass(
    edit_user: schemas.EditPassword,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    user_query = db.query(models.User).filter(models.User.id == current_user.id)
    user = user_query.first()

    if user == None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"User does not exist"
        )

    hashed_password = utils.hash(edit_user.password)
    edit_user.password = hashed_password
    user_query.update(edit_user.dict(), synchronize_session=False)  # type: ignore
    db.commit()

    return {"msg": "Change password success"}


# END PUT
