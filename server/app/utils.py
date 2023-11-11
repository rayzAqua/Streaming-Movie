"""
    Hash and verify password
"""

from datetime import datetime, timedelta, date
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from passlib.context import CryptContext
from jose import jwt
from .config import settings
import secrets
from . import models


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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


async def hash(password: str):
    return pwd_context.hash(password)


async def verify(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


class UnicornException(Exception):
    def __init__(self, status_code: int, detail: str, success: bool):
        self.status_code = status_code
        self.detail = detail
        self.success = success


def generate_expire_time():
    return datetime.utcnow() + timedelta(minutes=2)


async def sendVerifyEmail(dbSession, userData):
    new_verify_token = secrets.token_hex(32)
    new_token = models.Token(user_id=userData.id, token=new_verify_token)
    dbSession.add(new_token)

    # Tạo một chuỗi xác thực kiểm tra xem có đúng là user này yêu cầu xác thực tài khoản
    expire = generate_expire_time()
    new_data = {"user_id": userData.id, "email": userData.email, "exp": expire}
    new_user_token = jwt.encode(new_data, settings.secret_key, settings.algorithm)

    # Tạo url xác thực từ user_token và verify_token
    url = f"{settings.base_url}/verify/{new_user_token}/{new_verify_token}"

    # Gửi mail
    html = f"<p>Here is your verify link: {url}. Link will expired in 2 minutes</p>"
    message = MessageSchema(
        subject="Verify Email",
        recipients=[userData.email],
        body=html,
        subtype=MessageType.html,
    )
    await mail.send_message(message)

    # Chính thức lưu vào csdl
    dbSession.commit()


confirmation_data = {}


async def sendConfirmCodeEmail(email):
    # Tạo mã xác nhận email
    confirm_code = secrets.token_hex(3)
    expire_time = generate_expire_time()

    confirmation_data[email] = {
        "code": confirm_code,
        "expiration_time": expire_time,
    }
    # Gửi mail
    html = f"<p>Here is your code: <span>{confirm_code}</span>. Code will expired in 2 minutes</p>"
    message = MessageSchema(
        subject="Confirm Your Email",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )
    await mail.send_message(message)


class ErrorMessage:
    # Auth - Login
    LOGIN_ERROR_EMAIL = "Email does not exist."
    LOGIN_ERROR_PASSWORD = "Incorrect password."
    LOGIN_ERROR_LOCKED = "Your account is currently inactive. Please contact support."
    LOGIN_SUCCESS = "Login successfully."

    # Auth - Register
    REGISTER_ERROR_EMAIL = "Email already register."
    REGISTER_ERROR_PASSWORD = "Password is too short."
    REGISTER_ERROR_FULLNAME_01 = "Full Name is required."
    REGISTER_ERROR_FULLNAME_02 = "Full Name is too long."
    REGISTER_SUCCESS = "Register successfully. Please verify your email."

    # Auth - Forget Password
    FORGET_ERROR_EMAIL = "User is not existed."
    FORGET_ERROR_CODE = "Invalid code."
    FORGET_ERROR_DATA_01 = "Invalid user confirmation data."
    FORGET_ERROR_DATA_02 = "Invalid Infomation."
    FORGET_ERROR_PASSWORD = "Password is too short."
    FORGET_EXISTED_CODE = (
        "An email has already been sent to your address. Please check it and verify."
    )
    FORGET_EXPIRED_CODE = "Code is expired. An email has been sent to your address. Please check it and verify."
    FORGET_SUCCESS_01 = (
        "An email has been sent to your address. Please check it and verify."
    )
    FORGET_SUCCESS_02 = "Confirmation code is correct. Proceed to change password."
    FORGET_SUCCESS_03 = "Change Password successfully. Please login again."

    # Verify
    VERIFY_WARNING_01 = "An email was sent to you. Please check."
    VERIFY_WARNING_02 = "Your account was not verify. Please verify."
    VERIFY_WARNING_03 = "User was verified."
    VERIFY_ERROR_TOKEN = "Invalid Token."
    VERIFY_SUCCESS = "Your account was verified."

    # Email
    EMAIL_ERROR_01 = "Email isn't exist."
    RESEND_EMAIL_SUCCESS = "A link had sent to your email."
