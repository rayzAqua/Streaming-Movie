"""
    Router payment
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
from fastapi.responses import JSONResponse
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional, Text, List
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy import and_, desc
from ..utils import UnicornException
from ..database import get_db
from .. import database, schemas, models, utils, oauth2

router = APIRouter(prefix="/payment", tags=["Payment"])


# POST
@router.post("/forFilm/{film_id}")
async def add_payment_for_film(
    film_id: int,
    days: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    try:
        film = db.query(models.Film).get(film_id)
        if not film:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Film not found."
            )
        if not film.status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Film not found."
            )

        pay = film.price * days
        end_date = datetime.now() + timedelta(days=days)

        payment = models.Payment(
            user_id=current_user.id,
            film_id=film_id,
            pay=pay,
            status=0,
            end_date=end_date,
        )

        db.add(payment)
        db.commit()
        db.refresh(payment)

        payment_data = {
            "id": payment.id,
            "user_id": payment.user_id,
            "film_id": payment.film_id,
            "pay": payment.pay,
            "status": payment.status,
            "created_at": payment.created_at,
            "end_date": payment.end_date,
            "customer": current_user.name,
            "email": current_user.email,
        }

        return {
            "success": True,
            "msg": "Payment added successfully",
            "payment": payment_data,
        }
    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


@router.post("/forPackage/{pricing_id}")
async def add_payment_for_package(
    pricing_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    try:
        # Check already register
        payment = (
            db.query(models.Payment)
            .filter(
                and_(
                    models.Payment.user_id == current_user.id,
                    models.Payment.film_id == None,
                    models.Payment.end_date >= datetime.now(),
                )
            )
            .first()
        )
        if payment:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Already Register."
            )

        package = db.query(models.Pricing).get(pricing_id)
        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Package not found."
            )
        if not package.status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Package not found."
            )

        pay = package.price

        # Convert pricing.days to an integer before using it in timedelta
        days = int(package.days)
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

        payment_data = {
            "id": payment.id,
            "user_id": payment.user_id,
            "film_id": payment.film_id,
            "pay": payment.pay,
            "status": payment.status,
            "created_at": payment.created_at,
            "end_date": payment.end_date,
            "customer": current_user.name,
            "email": current_user.email,
        }

        return {
            "success": True,
            "msg": "Payment added successfully",
            "payment": payment_data,
        }
    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


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
    try:
        validPayments = (
            db.query(
                models.Payment.id.label("id"),
                models.Pricing.name.label("pricing_name"),
                models.Film.title.label("film_name"),
                models.Payment.status.label("status"),
                models.Payment.end_date.label("end_date"),
            )
            .outerjoin(models.Film, models.Payment.film_id == models.Film.id)
            .outerjoin(models.Pricing, models.Payment.pricing_id == models.Pricing.id)
            .filter(
                and_(
                    models.Payment.user_id == current_user.id,
                    models.Payment.status != 0,
                    models.Payment.end_date >= datetime.now(),
                )
            )
            .order_by(desc(models.Payment.end_date))
            .all()
        )

        print(validPayments)

        if validPayments:
            # Kiểm tra xem có ít nhất một payment có pricing_name hay không.
            for payment in validPayments:
                # Nếu có payment có pricing_name, thêm payment đó vào result_dict và trả về kết quả.
                if payment.pricing_name:
                    result_dict = {
                        "id": payment.id,
                        "pricing_name": payment.pricing_name,
                        "film_name": payment.film_name,
                        "status": payment.status,
                        "end_date": payment.end_date,
                    }
                    return {
                        "success": True,
                        "msg": "User has valid package.",
                        "package": [result_dict],
                    }

            # Nếu không có payment nào có pricing_name, trả về toàn bộ validPayments
            result_dict = [
                {
                    "id": payment.id,
                    "pricing_name": payment.pricing_name,
                    "film_name": payment.film_name,
                    "status": payment.status,
                    "end_date": payment.end_date,
                }
                for payment in validPayments
            ]

            return {
                "success": True,
                "msg": "User has valid payment.",
                "package": result_dict,
            }
        else:
            return {
                "success": False,
                "msg": "User didn't have any package.",
                "package": [],
            }

    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


@router.get("/checkPaymentSuccess/{payment_id}")
async def getActivePayment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    try:
        query = db.query(models.Payment).filter(
            and_(
                models.Payment.id == payment_id,
                models.Payment.user_id == current_user.id,
            )
        )

        payment = query.first()

        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Bill isn't existing."
            )

        if payment.status == 0:
            return {"success": False, "msg": "Order isn't payment."}

        return {"success": True, "msg": "Payment successfully."}

    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


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


# DELETE
@router.delete("/delete/{payment_id}")
async def cancelPayment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    try:
        query = db.query(models.Payment).filter(
            and_(
                models.Payment.id == payment_id,
                models.Payment.user_id == current_user.id,
            )
        )

        payment = query.first()

        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Bill isn't existing."
            )
        if payment.status == 1:
            return {"success": False, "msg": "Already payment."}

        db.delete(payment)
        db.commit()

        return {"success": True, "msg": "Delete bill successfully."}

    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )
