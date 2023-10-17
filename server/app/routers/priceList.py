"""
Router priceList
Author: Team 12
Email: hoangha0612.work@gmail.com
"""

from fastapi import (
    APIRouter,
    Depends,
    status,
    HTTPException,
)
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional, Text, List
from ..database import get_db
from .. import database, schemas, models, utils, oauth2
from ..utils import UnicornException


router = APIRouter(prefix="/price", tags=["Price"])

# POST


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_price(
    price_data: schemas.Price,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    try:
        # Check duration price value.
        if price_data.price < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Price should be a non-negative number.",
            )
        # Check existed pricê.
        isExistedPrice = (
            db.query(models.Price_List)
            .filter(models.Price_List.price == price_data.price)
            .first()
        )
        if isExistedPrice:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Price is already existed.",
            )

        new_price = models.Price_List(**price_data.dict())
        db.add(new_price)
        db.commit()
        return {"success": True, "msg": f"Price created successfully."}
    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


# END POST
