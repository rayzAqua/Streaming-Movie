"""
Router payment
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
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy import desc


from ..database import get_db
from .. import database, schemas, models, utils, oauth2

router = APIRouter(prefix="/payment", tags=["Payment"])


# POST
@router.post("/forFilm/{film_id}", status_code=status.HTTP_201_CREATED)
def add_payment_for_film(
    film_id: int,
    days: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    film = db.query(models.Film).get(film_id)
    if not film:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Film not found"
        )
    if not film.status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Film not found"
        )

    pay = film.price * days
    end_date = datetime.now() + timedelta(days=days)

    payment = models.Payment(
        user_id=current_user.id, film_id=film_id, pay=pay, status=0, end_date=end_date
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {"message": "Payment added successfully"}


@router.post("/forPackage/{pricing_id}", status_code=status.HTTP_201_CREATED)
def add_payment_for_film(
    pricing_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    pricing = db.query(models.Pricing).get(pricing_id)
    if not pricing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pricing not found"
        )
    if not pricing.status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pricing not found"
        )

    pay = pricing.price

    # Convert pricing.days to an integer before using it in timedelta
    days = int(pricing.days)
    end_date = datetime.now() + timedelta(days=days)

    payment = models.Payment(
        user_id=current_user.id,
        pricing_id=pricing_id,
        pay=pay,
        status=0,
        end_date=end_date,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {"message": "Payment added successfully"}


# END POST


# GET
@router.get("/getAll")
async def get_all_payment(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    query = (
        db.query(
            models.Payment.id.label("id"),
            models.User.email.label("user_email"),
            models.Pricing.name.label("pricing_name"),
            models.Film.title.label("film_name"),
            models.Payment.pay.label("pay"),
            models.Payment.status.label("status"),
            models.Payment.created_at.label("created_at"),
            models.Payment.end_date.label("end_date"),
        )
        .outerjoin(models.User, models.Payment.user_id == models.User.id)
        .outerjoin(models.Film, models.Payment.film_id == models.Film.id)
        .outerjoin(models.Pricing, models.Payment.pricing_id == models.Pricing.id)
        .all()
    )

    return query


@router.get("/getNewestPayment")
async def get_newest_payment(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    query = (
        db.query(
            models.Payment.id.label("id"),
            models.Pricing.name.label("pricing_name"),
            models.Film.title.label("film_name"),
            models.Payment.status.label("status"),
            models.Payment.end_date.label("end_date"),
        )
        .outerjoin(models.Film, models.Payment.film_id == models.Film.id)
        .outerjoin(models.Pricing, models.Payment.pricing_id == models.Pricing.id)
        .filter(models.Payment.user_id == current_user.id, models.Payment.status != 0)
        .order_by(desc(models.Payment.end_date))
        .first()
    )

    return query


# END GET


# PUT
@router.put("/edit/status/{payment_id}")
async def update_film_status(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    payment_query = db.query(models.Payment).filter(models.Payment.id == payment_id)
    payment = payment_query.first()

    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Payment does not exist"
        )

    if payment.status == 0:
        new_status = 1

    if payment.status == 1:
        new_status = 0

    edit_payment = {"status": new_status}

    payment_query.update(edit_payment, synchronize_session=False)
    db.commit()
    return {"msg": "Change film status success"}


# END PUT
