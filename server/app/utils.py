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
    LOGIN_ERROR_EMAIL = "Email isn't existing."
    LOGIN_ERROR_PASSWORD = "Incorrect password."
    LOGIN_ERROR_LOCKED = "Your account is currently inactive. Please contact support."
    LOGIN_SUCCESS = "Login successfully."

    # Auth - Register
    REGISTER_ERROR_EMAIL = "Email already registered."
    REGISTER_ERROR_PASSWORD = "Password is too short."
    REGISTER_ERROR_FULLNAME_01 = "Full name is required."
    REGISTER_ERROR_FULLNAME_02 = "Full name is too long."
    REGISTER_SUCCESS = "Register successfully. Please verify your email."

    # Auth - Forget Password
    FORGET_ERROR_EMAIL = "User isn't existing."
    FORGET_ERROR_CODE = "Invalid code."
    FORGET_ERROR_DATA_01 = "Invalid user confirmation data."
    FORGET_ERROR_DATA_02 = "Invalid infomation."
    FORGET_ERROR_PASSWORD = "Password is too short."
    FORGET_EXISTED_CODE = (
        "An email has already been sent to your address. Please check it and verify."
    )
    FORGET_EXPIRED_CODE = "Code is expired. An email has been sent to your address. Please check it and verify."
    FORGET_SUCCESS_01 = (
        "An email has been sent to your address. Please check it and verify."
    )
    FORGET_SUCCESS_02 = "Confirmation code is correct. Proceed to change password."
    FORGET_SUCCESS_03 = "Change password successfully. Please login again."

    # Verify
    VERIFY_WARNING_01 = "An email was sent to you. Please check."
    VERIFY_WARNING_02 = "Your account was not verify. Please verify."
    VERIFY_WARNING_03 = "User was verified."
    VERIFY_ERROR_TOKEN = "Invalid token."
    VERIFY_SUCCESS = "Your account was verified."

    # Email
    EMAIL_ERROR_01 = "Email isn't existing."
    EMAIL_CONFLICT = "Email already existed."
    RESEND_EMAIL_SUCCESS = "A link had sent to your email."

    # Actor
    ACTOR_NOT_FOUND = "Actor issn't existing."
    ACTOR_CREATE_SUCCESS = "Create actor successfully."
    ACTOR_EDIT_SUCCESS = "Edit actor successfully."

    # Film
    FILM_NOT_FOUND = "Film not found."
    FILM_CONFLICT = "Film conflict."
    FILM_ACTOR_NOT_FOUND = "Film_Actor not found."
    FILM_SUCCESS_01 = "Create successfully."
    FILM_SUCCESS_02 = "Add actor to film successfully."
    FILM_EDIT_SUCCESS_01 = "Edit film successfully."
    FILM_EDIT_SUCCESS_02 = "Change film status successfully."

    # Favorite
    FAVORITE_NOT_FOUND = "Favorite film not found."
    FAVORITE_ERROR_01 = "Film had been added to favorite lists."
    FAVORITE_ERROR_02 = "User has no favorite films."
    FAVORITE_SUCCESS = "Film add to favorite lists successfully."

    # Timestamp
    TIMESTAMP_ERROR_01 = "Film timestamp had been added."
    TIMESTAMP_ERROR_02 = "Invalid timestamp value."
    TIMESTAMP_ERROR_03 = "Timestamp isn't existing."
    TIMESTAMP_SUCCESS = "Timestamp add to film successfully."
    TIMESTAMP_EDIT_SUCCESS = "Change timestamp successfully."

    # Rating
    RATING_ERROR_01 = "Invalid rating value."
    RATING_ERROR_02 = "Rating isn't existing."
    RATING_SUCCESS = "Rating for film successfully."
    RATING_EDIT_SUCCESS = "Change rating successfully."

    # Genre
    GENRE_NOT_FOUND = "Genre is not exist."
    GENRE_EDIT_SUCCESS = "Edit Genre successfully."

    # Payment
    PAYMENT_NOT_FOUND = "Payment isn't existing."
    PAYMENT_ERROR_01 = "Already registered."
    PAYMENT_ERROR_02 = "Order isn't payment."
    PAYMENT_ERROR_03 = "Already payment."
    PAYMENT_CANCEL = "Order is cancel."
    PAYMENT_CREATE_SUCCESS = "Order create successfully."
    PAYMENT_SUCCESS = "Payment successfully."
    PAYMENT_VALID_SUCCESS = "User has valid package."
    PAYMENT_VALID_ERROR = "User didn't have any package."
    PAYMENT_EDIT_SUCCESS = "Change order status successfully."
    PAYMENT_DELETE_SUCCESS = "Delete order successfully."

    # Pricing
    PACKAGE_NOT_FOUND = "Package not found."
    PACKAGE_CREATE_SUCCESS = "Create package successfully."
    PACKAGE_GET_SUCCESS = "Get all active package successfully."
    PACKAGE_EDIT_SUCCESS_01 = "Edit package successfully."
    PACKAGE_EDIT_SUCCESS_02 = "Change package status successfully."

    # Upload
    UPLOAD_SUCCESS = "Upload successfully."
    UPLOAD_ERROR = "Upload error."

    # User
    USER_NOT_FOUND = "User isn't existing."
    USER_ERROR_NAME_01 = "Full name is required."
    USER_ERROR_NAME_02 = "Full name is too long."
    USER_ERROR_PASSWORD_01 = "Wrong current password."
    USER_ERROR_PASSWORD_02 = "New password must be diffirent old password."
    USER_CREATE_SUCCESS = "Create successfully."
    USER_PROFILE_SUCCESS = "Edit profile successfully."
    USER_PASSWORD_SUCCESS = "Change password successfully."

    # Vnpay
    VNPAY_VALID_SUCCESS = "Valid input payment infomation."
    VNPAY_VALID_ERROR = "Form input not validate."
    VNPAY_INVALID_SIGN = "Invalid signed."
