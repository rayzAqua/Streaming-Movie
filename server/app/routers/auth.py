"""
Router Authorize
Author: jinnguyen0612
Email: hoangha0612.work@gmail.com
"""

import random
from fastapi import APIRouter, Depends, status, HTTPException, Response
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic_settings import BaseSettings
from datetime import datetime, timedelta

from .. import database, schemas, models, utils, oauth2
from ..database import get_db
from ..config import settings


ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes


conf = ConnectionConfig(
    MAIL_USERNAME="aichisendou0612@gmail.com",
    MAIL_PASSWORD="bhdyvbibrnwxvhna",
    MAIL_FROM="aichisendou0612@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_FROM_NAME="NETMOVIE",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)

users_db = {"email": "", "verify_code": ""}

mail = FastMail(conf)

router = APIRouter(tags=["Authentication"])


@router.post("/login")
async def login(
    user_credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
):
    user = (
        db.query(models.User)
        .filter(models.User.email == user_credentials.username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=f"Invalid Credentials"
        )
    if not utils.verify(user_credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=f"Invalid Credentials"
        )

    # CREATE A TOKEN
    if user.role == 0:
        role = "ADMIN"
    else:
        role = "CUSTOMER"
    access_token = oauth2.create_access_token(
        data={"user_id": str(user.user_id), "role": role, "status": str(user.status)}
    )
    userOut = {
        "name": user.lname + user.fname,
        "role": role,
        "status": user.status,
    }
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "status": True,
        "userInfo": userOut,
        "expiresIn": expire,
    }


@router.post("/register")
async def register(user: schemas.Register, db: Session = Depends(get_db)):
    try:
        check_user = (
            db.query(models.User).filter(models.User.email == user.email).first()
        )
        if check_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Email already exists"
            )

        # Tạo mã xác thực ngẫu nhiên
        verification_code = str(random.randint(100000, 999999))

        users_db["email"] = user.email
        users_db["verify_code"] = verification_code

        html = f"<p>Mã xác thực của bạn là: {verification_code}</p>"

        message = MessageSchema(
            subject="Xác Thực Email",
            recipients=[user.email],
            body=html,
            subtype=MessageType.html,
        )

        # Gửi email xác thực
        await mail.send_message(message)

        # Tạo một bản ghi User mới với trạng thái verify (status = 2)
        hashed_password = utils.hash(user.password)
        user.password = hashed_password
        new_user = models.User(
            email=user.email, password=user.password, name=user.name, role=1, status=2
        )

        # Lưu thông tin người dùng vào cơ sở dữ liệu (sử dụng tham số db)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {"msg": "Code was sent"}
    except Exception as e:
        error_detail = str(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=error_detail
        )


@router.put("/verify")
async def verify(
    verify_code: str,
    current_user: int = Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    user_query = db.query(models.User).filter(models.User.id == current_user.id)
    stored_user = user_query.first()

    if (
        users_db["email"] == stored_user.email
        and users_db["verify_code"] == verify_code
    ):
        stored_user.status = 1  # Đặt trạng thái người dùng thành đã kích hoạt
        db.commit()
        return {"msg": "Account was verified"}

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect verify code"
    )
