"""
Router Authorize
Author: Team 12
Email: hoangha0612.work@gmail.com
"""

import random
from fastapi import APIRouter, Depends, status, HTTPException, Response
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse, PlainTextResponse
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy import and_
from sqlalchemy.orm import Session
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic_settings import BaseSettings
from datetime import datetime, timedelta, date
from .. import database, schemas, models, utils, oauth2
from ..database import get_db
from ..config import settings
from ..utils import UnicornException, sendConfirmCodeEmail, sendVerifyEmail
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
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Email does not exist.",
            )
        # Check status
        if not user.status:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is currently inactive. Please contact support.",
            )
        # Check verify
        if not user.verified:
            # send mail
            token = (
                db.query(models.Token)
                .filter(models.Token.user_id == user.user_id)
                .first()
            )
            if not token:
                # Send verify email
                await sendVerifyEmail(dbSession=db, userData=user)
                return {
                    "success": True,
                    "msg": "An email was sent to you. Please check.",
                }
            else:
                return {
                    "success": True,
                    "msg": "Your account was not verify. Please verify.",
                }
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
            "success": True,
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
        await sendVerifyEmail(dbSession=db, userData=new_user)

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
            # Nếu JWT đã hết hẹn thì truy vấn đến verify token trong db.
            # Mục đích: Mỗi verify link chỉ đc mở form resend-email một lần duy nhất.
            on_delete_token = (
                db.query(models.Token)
                .filter(models.Token.token == verify_token)
                .first()
            )
            # Nếu truy vấn mà có tồn tại token thì xoá token cũ đi và gửi link tạo mới.
            if on_delete_token:
                db.delete(on_delete_token)

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
                                                    responseMessage.textContent = `${data.msg}`;
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

                db.commit()

                return HTMLResponse(content=html_content)
            # Nếu không tồn tại verify token thì link không hợp lệ.
            else:
                return HTMLResponse(content="""<h1>Invalid Link.</h1>""")

        # Kiểm tra user từ user_data
        user_query = db.query(models.User).filter(
            and_(
                models.User.user_id == user_data["user_id"],
                models.User.email == user_data["email"],
            )
        )

        stored_user = user_query.first()

        if not stored_user:
            return HTMLResponse(content="""<h1>Invalid User.</h1>""")

        # Kiểm tra token từ stored_user và verify_token
        # Mục đích:
        # - Nếu đúng token của user thì hợp lệ.
        # - Nếu user_token chưa hết hạn mà đã xác thực mà vẫn cố truy cập vào thì Link không hợp lệ.
        isCorrectToken = (
            db.query(models.Token)
            .filter(
                and_(
                    models.Token.user_id == stored_user.user_id,
                    models.Token.token == verify_token,
                )
            )
            .first()
        )

        if not isCorrectToken:
            return HTMLResponse(content="""<h1>Invalid Link.</h1>""")

        stored_user.verified = True
        # Sau khi xác thực xong thì xoá verify token trong db đi để Link không còn dùng đc nữa (thao tác truy vấn).
        db.delete(isCorrectToken)
        db.commit()

        return {"success": True, "msg": "Your account was verified."}

    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


@router.post("/resend-email")
async def resendEmail(
    email_data: schemas.ResendEmail,
    db: Session = Depends(get_db),
):
    try:
        user = (
            db.query(models.User).filter(models.User.email == email_data.email).first()
        )
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Email isn't existed."
            )
        if user.verified:
            raise HTTPException(
                status_code=status.HTTP_406_NOT_ACCEPTABLE, detail="User was verified."
            )

        isExistedToken = (
            db.query(models.Token).filter(models.Token.user_id == user.user_id).first()
        )
        if isExistedToken:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Email was sent."
            )

        # Send verify email
        await sendVerifyEmail(dbSession=db, userData=user)

        return {"success": True, "msg": "A link had sent to your email."}

    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


@router.post("/forget-password")
async def forgetPassword(
    email_user: schemas.ForgetPassword, db: Session = Depends(get_db)
):
    try:
        user = (
            db.query(models.User).filter(models.User.email == email_user.email).first()
        )
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User is not existed."
            )

        # Kiểm tra xem user này đã có mã chưa.
        if user.email in utils.confirmation_data.keys():
            # Nếu đã có thì kiểm tra xem mã đã hết hạn chưa.
            current_time = datetime.utcnow()
            expiration_time = utils.confirmation_data[user.email]["expiration_time"]

            # Nếu chưa hết hạn thì trả về dòng thông báo là email đã gửi.
            if expiration_time and current_time <= expiration_time:
                # Mã xác nhận chưa hết hạn, không gửi lại
                return {
                    "success": True,
                    "msg": f"An email has already been sent to your address. Please check it and verify.",
                }

        # Nếu user chưa có mã thì gửi mã xác nhận email
        await sendConfirmCodeEmail(user.email)

        return {
            "success": True,
            "msg": f"An email has been sent to your address. Please check it and verify.",
        }

    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


@router.post("/confirm-code")
async def confirmCode(confirm_data: schemas.ConfirmCode, db: Session = Depends(get_db)):
    try:
        # Kiểm tra user
        # Email sẽ được lấy từ localStorage
        user = (
            db.query(models.User)
            .filter(models.User.email == confirm_data.email)
            .first()
        )
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User is not existed."
            )

        # Xác nhận
        if user.email in utils.confirmation_data.keys():
            # Kiểm tra mã xem có đúng không.
            if utils.confirmation_data[user.email]["code"] == confirm_data.code:
                # Nếu đúng thì kiểm tra thời hạn.
                current_time = datetime.utcnow()
                expiration_time = utils.confirmation_data[user.email]["expiration_time"]
                # Nếu chưa hết hạn thì xác nhận thành công.
                if expiration_time >= current_time:
                    # Xoá dữ liệu đi.
                    del utils.confirmation_data[user.email]
                    return {
                        "success": True,
                        "isCorrect": True,
                        "msg": f"Confirmation code is correct. Proceed to change password.",
                    }
                # Nếu hết hạn thì gửi lại email.
                else:
                    # Xoá dữ liệu cũ.
                    del utils.confirmation_data[user.email]
                    # Gửi mail mới.
                    await sendConfirmCodeEmail(user.email)
                    return {
                        "success": False,
                        "isCorrect": False,
                        "msg": f"Code is expired. An email has been sent to your address. Please check it and verify.",
                    }
            # Nếu mã không đúng
            else:
                return {
                    "success": False,
                    "isCorrect": False,
                    "msg": f"Invalid code.",
                }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid user confirmation data.",
            )

    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )
