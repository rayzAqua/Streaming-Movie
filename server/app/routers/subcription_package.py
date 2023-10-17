"""
Router package
Author: Team 12
Email: hoangha0612.work@gmail.com
"""

from datetime import datetime, timedelta, date
from fastapi import (
    APIRouter,
    Depends,
    status,
    HTTPException,
)
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy import and_, between, or_
from sqlalchemy.orm import Session
from typing import Optional, Text, List
from ..database import get_db
from .. import database, schemas, models, utils, oauth2
from ..utils import UnicornException


router = APIRouter(prefix="/package", tags=["Package"])


# POST


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_package(
    package: schemas.Package,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    try:
        # Check existed name.
        if package.package_name == "" or not package.package_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Package Name is required.",
            )
        # Check existed duration.
        if package.duration is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Package Duration is required.",
            )
        # Check length of package name.
        if len(package.package_name) > 32:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Package Name is too long.",
            )
        # Check duration value.
        if package.duration < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Duration should greater than 1.",
            )
        # Check existed duration.
        isExistedPackage = (
            db.query(models.Subcription_Package)
            .filter(models.Subcription_Package.package_name == package.package_name)
            .first()
        )
        if isExistedPackage:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Package is existed.",
            )

        # Add package
        new_package = models.Subcription_Package(**package.dict())
        db.add(new_package)
        db.commit()
        return {"success": True, "msg": f"Create package success."}
    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


@router.post("/addPrice/{package_id}", status_code=status.HTTP_201_CREATED)
async def addPrice(
    package_id: int,
    package_price: schemas.PackagePrice,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    try:
        # Check isExisted package.
        isExistedPackage = (
            db.query(models.Subcription_Package)
            .filter(models.Subcription_Package.package_id == package_id)
            .first()
        )
        if not isExistedPackage:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Package isn't existed.",
            )
        # Check price_id
        if package_price.price_id < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Price ID be a non-negative number.",
            )
        if package_price.start_at < datetime.now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start Date cannot be in the past.",
            )
        if package_price.end_at < datetime.now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End Date cannot be in the past.",
            )
        if package_price.start_at >= package_price.end_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start Date cannot be equal or greater than End Date.",
            )

        # Check isExisted price.
        isExistedPrice = (
            db.query(models.Price_List)
            .filter(models.Price_List.price_id == package_price.price_id)
            .first()
        )
        if not isExistedPrice:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Price isn't existed.",
            )

        # Check price is already existed from start_at to end_at.
        existing_package_price = (
            db.query(models.Package_Price)
            .filter(
                and_(
                    models.Package_Price.package_id == isExistedPackage.package_id,
                    models.Package_Price.price_id == package_price.price_id,
                    models.Package_Price.start_at < package_price.end_at,
                    models.Package_Price.end_at > package_price.start_at,
                )
            )
            .first()
        )
        if existing_package_price:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Price for this package already existed.",
            )

        # Add package
        new_data = {
            "price_id": package_price.price_id,
            "package_id": package_id,
            "start_at": package_price.start_at,
            "end_at": package_price.end_at,
        }
        new_package_price = models.Package_Price(**new_data)
        db.add(new_package_price)
        db.commit()

        return {"success": True, "msg": "Add price for package successfully."}
    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


# END POST


# GET


@router.get("/getAll")
async def get_all_Pricing(db: Session = Depends(get_db)):
    pricing = db.query(models.Pricing).all()
    return pricing


@router.get("/getActive", response_model=List[schemas.PackageOut])
async def get_active_Pricing(db: Session = Depends(get_db)):
    pricing = (
        db.query(models.Subcription_Package)
        .filter(models.Subcription_Package.status == True)
        .all()
    )
    return pricing


@router.get("/get/{id}", response_model=schemas.PackageOut)
async def get_pricing(
    id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    pricing = (
        db.query(models.Subcription_Package)
        .filter(models.Subcription_Package.id == id)
        .first()
    )
    if not pricing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pricing does not exist"
        )
    return pricing


# END GET


# PUT


@router.put("/edit/{package_id}")
async def update_package(
    package_id: int,
    edit_package_data: schemas.Package,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    try:
        package_query = db.query(models.Subcription_Package).filter(
            models.Subcription_Package.package_id == package_id
        )
        package = package_query.first()

        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=f"Package does not exist."
            )

        # Only data is not None can update.
        update_data = {}
        if (
            edit_package_data.package_name is not None
            and edit_package_data.package_name != ""
        ):
            # Check existed package name.
            isExistedName = (
                db.query(models.Subcription_Package)
                .filter(
                    models.Subcription_Package.package_name
                    == edit_package_data.package_name
                )
                .first()
            )
            if isExistedName and isExistedName.package_id != package_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Package Name is existed.",
                )
            # Check length of package name.
            if len(edit_package_data.package_name) > 32:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Package Name is too long.",
                )
            # If everything is ok.
            else:
                update_data["package_name"] = edit_package_data.package_name
        if edit_package_data.duration is not None:
            # Check duration value.
            if edit_package_data.duration < 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Duration should greater than 1.",
                )
            # If everything is ok.
            else:
                update_data["duration"] = edit_package_data.duration

        if update_data:
            package_query.update(update_data, synchronize_session=False)  # type: ignore
            db.commit()

        return {"success": True, "msg": f"Edit package success."}
    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


@router.put("/edit/status/{package_id}")
async def update_package_status(
    package_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    package_query = db.query(models.Subcription_Package).filter(
        models.Subcription_Package.package_id == package_id
    )
    package = package_query.first()

    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Package does not exist."
        )

    new_status = not package.status
    edit_status = {"status": new_status}

    package_query.update(edit_status, synchronize_session=False)
    db.commit()
    return {"success": True, "msg": "Change package status success."}


@router.put("/editPackagePrice/{package_id}/{pp_id}")
async def editPrice(
    package_id: int,
    pp_id: int,
    edit_package_price: schemas.EditPackagePrice,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    try:
        update_data = {}

        # Check isExisted package.
        isExistedPackage = (
            db.query(models.Subcription_Package)
            .filter(models.Subcription_Package.package_id == package_id)
            .first()
        )
        if not isExistedPackage:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Package isn't existed.",
            )

        # Check package is had price
        query = db.query(models.Package_Price).filter(
            models.Package_Price.pp_id == pp_id
        )
        isExistedPrice = query.first()
        if not isExistedPrice:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Not Found Package Price.",
            )

        # Validate
        if edit_package_price.price_id is not None:
            # id is non-negative number
            if edit_package_price.price_id < 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Package ID or Price ID be a non-negative number.",
                )

            # Check isExisted price.
            isExistedPrice = (
                db.query(models.Price_List)
                .filter(models.Price_List.price_id == edit_package_price.price_id)
                .first()
            )
            if not isExistedPrice:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Price isn't existed.",
                )
        if (
            edit_package_price.start_at is not None
            and edit_package_price.end_at is not None
        ):
            if edit_package_price.start_at >= edit_package_price.end_at:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Start Date cannot be equal or greater than End Date.",
                )

            # Check price is already existed from start_at to end_at.
            existing_package_price = (
                db.query(models.Package_Price)
                .filter(
                    and_(
                        models.Package_Price.start_at <= edit_package_price.end_at,
                        models.Package_Price.end_at >= edit_package_price.s,
                    )
                )
                .first()
            )

            if existing_package_price and existing_package_price.pp_id != pp_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Price for this package already existed.",
                )
            else:
                update_data = {
                    "price_id": edit_package_price.price_id,
                    "package_id": package_id,
                    "start_at": edit_package_price.start_at,
                    "end_at": edit_package_price.end_at,
                }

        # Update package
        if update_data:
            query.update(update_data)
            db.commit()

        return {"success": True, "msg": "Update price for package successfully."}
    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


# END PUT
