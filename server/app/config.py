"""
    Config const
"""

from pydantic_settings import BaseSettings


# Lớp Settings kế thừa lớp BaseSettings (lớp cơ sở định nghĩa cài đặt cấu hình cho ứng dụng).
class Settings(BaseSettings):
    database_hostname: str
    database_port: str
    database_password: str
    database_name: str
    database_username: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    base_url: str

    # Thiết lập env_file là file .env để đọc thông tin cấu hình từ filw .env
    class Config:
        env_file = ".env"


settings = Settings()  # type:ignore
