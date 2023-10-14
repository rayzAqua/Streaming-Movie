"""
Router User
Author: jinnguyen0612
Email: hoangha0612.work@gmail.com
"""

from datetime import date
import json
from fastapi import APIRouter, Depends, status, HTTPException, Response
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import schemas, models, utils, oauth2
from ..utils import UnicornException


router = APIRouter(prefix="/user", tags=["User"])


# POST
@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    try:
        if user.lname == "":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Last Name is required."
            )
        if user.fname == "":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="First Name is required.",
            )
        # Lenght of name valiđate
        if len(user.lname) >= 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Last Name is too long."
            )
        if len(user.fname) >= 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="First Name is too long.",
            )
        # BirthDate valiđate
        if user.birth_date != None and user.birth_date > date.today():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="BirthDate cannot be in the future.",
            )

        isExistedUser = (
            db.query(models.User).filter(models.User.email == user.email).first()
        )
        if isExistedUser:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Email already exists."
            )
        hashed_password = await utils.hash(user.password)
        user.password = hashed_password
        new_user = models.User(**user.dict())
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"success": True, "msg": "Create success."}
    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


# GET
@router.get("/getAll")
async def get_all_users(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    users = db.query(models.User).all()
    if not users:
        return {"success": False, "detail": []}
    user_data = [
        {
            "user_id": user.user_id,
            "email": user.email,
            "lname": user.lname,
            "fname": user.fname,
            "birth_date": user.birth_date,
            "isAdmin": user.isAdmin,
            "verified": user.verified,
            "status": user.status,
            "created_at": user.created_at,
        }
        for user in users
    ]
    return {"success": True, "data": user_data}


@router.get("/get/{user_id}")
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        return {"success": False, "detail": "Not found."}
    user_data = {
        "user_id": user.user_id,
        "email": user.email,
        "lname": user.lname,
        "fname": user.fname,
        "birth_date": user.birth_date,
        "isAdmin": user.isAdmin,
        "verified": user.verified,
        "status": user.status,
        "created_at": user.created_at,
    }

    return {"success": True, "data": user_data}


@router.get("/getCustomer")
async def get_all_customer(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    customers = db.query(models.User).filter(models.User.isAdmin == False).all()
    if not customers:
        return {"success": False, "detail": []}
    customer_data = [
        {
            "user_id": customer.user_id,
            "email": customer.email,
            "lname": customer.lname,
            "fname": customer.fname,
            "birth_date": customer.birth_date,
            "isAdmin": customer.isAdmin,
            "verified": customer.verified,
            "status": customer.status,
            "created_at": customer.created_at,
        }
        for customer in customers
    ]
    return {"success": True, "data": customer_data}


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
