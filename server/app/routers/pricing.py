"""
    Router pricing
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
from ..utils import UnicornException


router = APIRouter(prefix="/pricing", tags=["Pricing"])

msg = utils.ErrorMessage()


# POST
@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_pricing(
    pricing: schemas.Pricing,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    new_pricing = models.Pricing(**pricing.dict())
    db.add(new_pricing)
    db.commit()
    db.refresh(new_pricing)
    return {"msg": msg.PACKAGE_CREATE_SUCCESS}


# END POST


# GET
@router.get("/getAll", response_model=List[schemas.PricingOut])
async def get_all_Pricing(db: Session = Depends(get_db)):
    pricing = db.query(models.Pricing).all()
    return pricing


@router.get("/getActive")
async def get_active_Pricing(db: Session = Depends(get_db)):
    try:
        packages = db.query(models.Pricing).filter(models.Pricing.status == True).all()

        if not packages:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=msg.PACKAGE_NOT_FOUND
            )

        package_data = [
            {
                "id": package.id,
                "name": package.name,
                "price": package.price,
                "days": package.days,
                "status": package.status,
            }
            for package in packages
        ]

        return {
            "success": True,
            "msg": msg.PACKAGE_GET_SUCCESS,
            "packages": package_data,
        }

    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


@router.get("/get/{id}", response_model=schemas.PricingOut)
async def get_pricing(
    id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    pricing = db.query(models.Pricing).filter(models.Pricing.id == id).first()
    if not pricing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=msg.PACKAGE_NOT_FOUND
        )
    return pricing


# END GET


# PUT
@router.put("/edit/{pricing_id}")
async def update_price(
    pricing_id: int,
    edit_pricing: schemas.Pricing,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    try:
        pricing_query = db.query(models.Pricing).filter(models.Pricing.id == pricing_id)
        pricing = pricing_query.first()

        if pricing == None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=msg.PACKAGE_NOT_FOUND
            )

        pricing_query.update(edit_pricing.dict(), synchronize_session=False)  # type: ignore
        db.commit()
        return {"msg": msg.PACKAGE_EDIT_SUCCESS_01}
    except Exception as e:
        error_detail = str(e)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=error_detail
        )


@router.put("/edit/status/{pricing_id}")
async def update_pricing_status(
    pricing_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    pricing_query = db.query(models.Pricing).filter(models.Pricing.id == pricing_id)
    pricing = pricing_query.first()

    if pricing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=msg.PACKAGE_NOT_FOUND
        )

    new_status = not pricing.status
    edit_pricing = {"status": new_status}

    pricing_query.update(edit_pricing, synchronize_session=False)
    db.commit()
    return {"msg": msg.PACKAGE_EDIT_SUCCESS_02}


# END PUT
