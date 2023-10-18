"""
    Config Database
"""

import time
import psycopg2
from psycopg2.extras import RealDictCursor
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Định nghĩa chuỗi kết nối DB.
SQLALCHEMY_DATABASE_URL = f"postgresql://{settings.database_username}:{settings.database_password}@{settings.database_hostname}:{settings.database_port}/{settings.database_name}"

# Tạo chuỗi kết nối đến DB.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Định nghĩa một phiên làm việc với CSDL với kết nối là engine.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Định nghĩa một lớp cơ sở để định nghĩa các bảng trong CSDL.
Base = declarative_base()


# Tạo và đóng phiên làm việc với CSDL để quản lý tài nguyên.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
