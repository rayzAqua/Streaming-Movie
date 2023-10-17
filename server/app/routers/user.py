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
        if len(user.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password need to 6 characters.",
            )
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
        if len(user.lname) > 36:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Last Name is too long."
            )
        if len(user.fname) > 12:
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
        return {"success": False, "detail": "User does not exist."}
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


@router.get("/getFavoriteMovie")
async def get_favorite_movie(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    f_films = (
        db.query(models.Favorite_Film)
        .filter(models.Favorite_Film.user_id == current_user.user_id)
        .all()
    )
    if not f_films:
        return {"success": False, "detail": []}

    f_film_data = [
        {
            "film_id": f_film.film_id,
        }
        for f_film in f_films
    ]
    return {"success": True, "data": f_film_data}


@router.get("/profile")
async def get_profile(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    user = (
        db.query(models.User)
        .filter(models.User.user_id == current_user.user_id)
        .first()
    )
    if not user:
        return {"success": False, "detail": "User does not exist."}
    user_profile = {
        "email": user.email,
        "lname": user.lname,
        "fname": user.fname,
        "birth_date": user.birth_date,
        "created_at": user.created_at,
    }
    return {"success": True, "data": user_profile}


# END GET


# PUT
@router.put("/editProfile")
async def update_profile(
    edit_user: schemas.EditProfile,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    try:
        user_query = db.query(models.User).filter(
            models.User.user_id == current_user.user_id
        )
        user = user_query.first()

        if not user:
            return {"success": False, "detail": "User does not exist."}

        update_data = {}

        if edit_user.lname is not None and edit_user.lname != "":
            if len(edit_user.lname) > 36:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="LastName is too long.",
                )
            else:
                update_data["lname"] = edit_user.lname

        if edit_user.fname is not None and edit_user.fname != "":
            if len(edit_user.fname) > 12:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="FirstName is too long.",
                )
            else:
                update_data["fname"] = edit_user.fname

        if edit_user.birth_date is not None:
            if edit_user.birth_date >= date.today():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="BirthDate cannot greater than current day.",
                )
            else:
                update_data["birth_date"] = edit_user.birth_date

        if update_data:
            user_query.update(update_data, synchronize_session=False)
            db.commit()

        return {"succes": True, "msg": "Edit profile success"}
    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


@router.put("/changePass")
async def change_pass(
    edit_user: schemas.EditPassword,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    try:
        user_query = db.query(models.User).filter(
            models.User.user_id == current_user.user_id
        )
        user = user_query.first()

        if not user:
            return {"success": False, "detail": "User does not exist."}

        if len(edit_user.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password need to 6 characters.",
            )
        hashed_password = await utils.hash(edit_user.password)
        edit_user.password = hashed_password
        user_query.update(edit_user.dict(), synchronize_session=False)  # type: ignore
        db.commit()

        return {"success": True, "msg": "Change password success"}
    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


# END PUT
