"""
    Router User
"""

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
):
    # Empty name validate
    if user.name == "":
        return {"detail": "Full Name is required."}
    # Lenght of name valiđate
    if len(user.name) > 32:
        return {"detail": "Full Name is too long."}
    check_user = db.query(models.User).filter(models.User.email == user.email).first()
    if check_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already exists"
        )
    hashed_password = await utils.hash(user.password)
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
    customer = db.query(models.User).filter(models.User.isAdmin == False).all()
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
    try:
        user_query = db.query(models.User).filter(models.User.id == current_user.id)
        user = user_query.first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=f"User does not exist"
            )

        if len(edit_user.name) > 32:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=f"Name is too long"
            )

        update_data = {"name": edit_user.name}
        user_query.update(update_data, synchronize_session=False)  # type: ignore
        db.commit()

        update_user = user_query.first()

        return {"success": True, "msg": "Edit profile success", "update": update_user}
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
        user_query = db.query(models.User).filter(models.User.id == current_user.id)
        user = user_query.first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=f"User does not exist"
            )

        if not await utils.verify(edit_user.curr_pass, user.password):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=f"Wrong current password"
            )

        if len(edit_user.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail=f"Password is too short"
            )

        if edit_user.curr_pass == edit_user.password:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"New password must be diffirent old password",
            )

        hashed_password = await utils.hash(edit_user.password)
        update_data = {"password": hashed_password}
        user_query.update(update_data, synchronize_session=False)  # type: ignore
        db.commit()

        return {"success": True, "msg": "Change password success"}
    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


# END PUT
