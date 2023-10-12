"""
Router Authorize
Author: jinnguyen0612
Email: hoangha0612.work@gmail.com
"""

import random
from fastapi import APIRouter, Depends, status, HTTPException, Response
from fastapi.responses import HTMLResponse
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic_settings import BaseSettings
from datetime import datetime, timedelta, date
from .. import database, schemas, models, utils, oauth2
from ..database import get_db
from ..config import settings
from ..utils import UnicornException
import secrets
from jose import JWSError, jwt
from jose.exceptions import ExpiredSignatureError


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
    try:
        user = (
            db.query(models.User)
            .filter(models.User.email == user_credentials.username)
            .first()
        )

        # Check user
        if not user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail=f"Email does not exist."
            )
        # Check status
        if not user.status:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is currently inactive. Please contact support.",
            )
        # Check password
        if not await utils.verify(user_credentials.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail=f"Incorrect password."
            )

        # CREATE A TOKEN
        # Role
        if user.isAdmin:
            role = "ADMIN"
        else:
            role = "CUSTOMER"
        # Generate a access token
        access_token = oauth2.create_access_token(
            data={"user_id": str(user.user_id), "role": role}
        )
        userInfo = {
            "name": user.lname + user.fname,
            "role": role,
        }
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        return {
            "token_type": "bearer",
            "access_token": access_token,
            "status": True,
            "userInfo": userInfo,
            "expiresIn": expire,
        }
    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


@router.post("/register")
async def register(user: schemas.Register, db: Session = Depends(get_db)):
    try:
        # Empty name validate
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

        check_user = (
            db.query(models.User).filter(models.User.email == user.email).first()
        )
        if check_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Email already exists."
            )

        # Tạo một bản ghi User mới với trạng thái verify (status = 2)
        hashed_password = await utils.hash(user.password)
        new_user = models.User(
            email=user.email,
            password=hashed_password,
            lname=user.lname,
            fname=user.fname,
        )

        # Lưu thông tin người dùng vào cơ sở dữ liệu (sử dụng tham số db)
        db.add(new_user)
        # Tạm thời lưu vào csdl
        db.flush()

        # XÁC THỰC EMAIL
        # Tạo một chuỗi xác thực ngẫu nhiên và thêm vào db
        verify_token = secrets.token_hex(32)
        new_token = models.Token(user_id=new_user.user_id, token=verify_token)
        db.add(new_token)

        # Tạo một chuỗi xác thực kiểm tra xem có đúng là user này yêu cầu xác thực tài khoản
        expire = datetime.utcnow() + timedelta(minutes=2)
        data = {"user_id": new_user.user_id, "email": new_user.email, "exp": expire}
        user_token = jwt.encode(data, settings.secret_key, settings.algorithm)

        # Tạo url xác thực từ user_token và verify_token
        url = f"http://localhost:8000/verify/{user_token}/{verify_token}"

        # Gửi mail
        html = f"<p>Here is your verify link: {url}</p>"
        message = MessageSchema(
            subject="Verify Email",
            recipients=[new_user.email],
            body=html,
            subtype=MessageType.html,
        )
        await mail.send_message(message)

        # Chính thức lưu vào csdl
        db.commit()

        return {
            "success": True,
            "msg": "Create user successfully. Please verify your email",
        }
    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


@router.get("/verify/{user_token}/{verify_token}")
async def verify(
    user_token: str,
    verify_token: str,
    db: Session = Depends(get_db),
):
    try:
        # Giải mã JWT và lưu thông tin vào user_data
        try:
            user_data = jwt.decode(
                user_token, settings.secret_key, algorithms=settings.algorithm
            )
        except ExpiredSignatureError:
            # JWT hết hạn
            on_delete_token = (
                db.query(models.Token)
                .filter(models.Token.token == verify_token)
                .first()
            )
            if on_delete_token:
                db.delete(on_delete_token)
                db.commit()
            html_content = """
                            <html>
                                <head>
                                    <style>
                                        body {
                                            font-family: Arial, sans-serif;
                                            background-color: #f7f7f7;
                                            text-align: center;
                                            padding: 20px;
                                        }
                                        form {
                                            background-color: #fff;
                                            border: 1px solid #ccc;
                                            padding: 20px;
                                            border-radius: 5px;
                                            max-width: 300px;
                                            margin: 0 auto;
                                        }
                                        p {
                                            margin: 0;
                                            padding: 10px;
                                        }
                                        input {
                                            width: 100%;
                                            padding: 10px;
                                            margin: 10px 0;
                                            border: 1px solid #ccc;
                                            border-radius: 5px;
                                        }
                                        button {
                                            background-color: #007bff;
                                            color: #fff;
                                            border: none;
                                            padding: 10px 20px;
                                            border-radius: 5px;
                                            cursor: pointer;
                                        }
                                        button:hover {
                                            background-color: #0056b3;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <p>Link has expired.</p>
                                    <p>Enter your email address to receive a new verification link:</p>
                                    <form id="email-form">
                                        <p id="response-message"></p>
                                        <input type="email" id="email" name="email" required>
                                        <button type="button" onclick="sendEmail()">Resend Email</button>
                                    </form>

                                    <script>
                                        function sendEmail() {
                                            const emailInput = document.getElementById("email");
                                            const emailValue = emailInput.value;
                                            const responseMessage = document.getElementById("response-message");

                                            if (!emailValue || emailValue === "") {
                                                responseMessage.textContent = "Email is required";
                                                return;
                                            } else {
                                                responseMessage.textContent = "";
                                            }
                                           
                                            const formData = { email: emailValue };

                                            fetch("/resend-email", {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json"
                                                    },
                                                body: JSON.stringify(formData)
                                            })
                                            .then(response => response.json())
                                            .then(data => {
                                                if (data.success === true) {
                                                    responseMessage.textContent = `${data.detail}`;
                                                } else {
                                                    responseMessage.textContent = `Resend failed: ${data.detail}`;
                                                }                                  
                                            })
                                            .catch(error => {
                                                console.error("Error:", error);
                                            });
                                        }
                                    </script>
                                </body>
                            </html>
                            """
            return HTMLResponse(content=html_content)

        # Kiểm tra user từ user_data
        user_query = db.query(models.User).filter(
            models.User.user_id == user_data["user_id"]
            and models.User.email == user_data["email"]
        )

        stored_user = user_query.first()

        if not stored_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Link"
            )

        # Kiểm tra token từ stored_user và verify_token
        isCorrectToken = (
            db.query(models.Token)
            .filter(
                models.Token.user_id == stored_user.user_id
                and models.Token.token == verify_token
            )
            .first()
        )

        if not isCorrectToken:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Link"
            )

        stored_user.verified = True
        db.delete(isCorrectToken)
        db.commit()

        return {"success": True, "msg": "Your account was verified."}

    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


@router.post("/resend-email")
async def verify(
    email_data: schemas.ResendEmail,
    db: Session = Depends(get_db),
):
    try:
        email = email_data.email

        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Email isn't existed"
            )

        new_verify_token = secrets.token_hex(32)
        new_token = models.Token(user_id=user.user_id, token=new_verify_token)
        db.add(new_token)

        # Tạo một chuỗi xác thực kiểm tra xem có đúng là user này yêu cầu xác thực tài khoản
        expire = datetime.utcnow() + timedelta(minutes=2)
        new_data = {"user_id": user.user_id, "email": user.email, "exp": expire}
        new_user_token = jwt.encode(new_data, settings.secret_key, settings.algorithm)

        # Tạo url xác thực từ user_token và verify_token
        url = f"http://localhost:8000/verify/{new_user_token}/{new_verify_token}"

        # Gửi mail
        html = f"<p>Here is your verify link: {url}</p>"
        message = MessageSchema(
            subject="Verify Email",
            recipients=[user.email],
            body=html,
            subtype=MessageType.html,
        )
        await mail.send_message(message)

        # Chính thức lưu vào csdl
        db.commit()

        return {"success": True, "msg": "A link had sent to your email."}

    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )
