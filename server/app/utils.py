"""
Hash and verify password
Author: Team 12
Email: hoangha0612.work@gmail.com
"""

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def hash(password: str):
    return pwd_context.hash(password)


async def verify(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


class UnicornException(Exception):
    def __init__(self, status_code: int, detail: str, success: bool):
        self.status_code = status_code
        self.detail = detail
        self.success = success
