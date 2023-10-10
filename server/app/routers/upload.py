"""
Router UPLOAD
Author: jinnguyen0612
Email: hoangha0612.work@gmail.com
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
from fastapi.responses import JSONResponse
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional, Text, List
from secrets import token_hex
import firebase_admin
from firebase_admin import credentials, storage
import requests
import cloudinary
import cloudinary.uploader


from ..database import get_db
from .. import database, schemas, models, utils, oauth2

router = APIRouter(prefix="/upload", tags=["Upload"])

# config Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(
    cred, {"storageBucket": "moviestreaming-a0fc2.appspot.com"}
)

# config cloudinary
cloudinary.config(
    cloud_name="dlg00ljfz",
    api_key="217353859529719",
    api_secret="eW6GmT0cTCoWfafIVo-aqdRgZv4",
)


@router.post("/photo", status_code=status.HTTP_200_OK)
async def uploadPhoto(photo: UploadFile = File(...)):
    try:
        # Lưu tệp tin được tải lên lên Firebase Storage
        file_name = token_hex(12)
        bucket = storage.bucket()
        blob = bucket.blob(f"pictures/{file_name}.jpg")
        blob.upload_from_file(photo.file, content_type="image/jpeg")

        # Lấy đường dẫn công khai của tệp tin đã tải lên
        blob.make_public()
        picture_url = blob.public_url

        return {"message": "Upload success", "picture_url": picture_url}
    except Exception as e:
        response = Response(content={"message": "Upload error", "error": str(e)})
        response.status_code = status.HTTP_404_NOT_FOUND
        return response


@router.post("/video")
async def upload_video(video_file: UploadFile = File(...)):
    try:
        upload_result = cloudinary.uploader.upload_large(
            video_file.file, resource_type="video"
        )

        public_id = upload_result.get("public_id")
        secure_url = upload_result.get("secure_url")
        return {
            "message": "Upload success",
            "public_id": public_id,
            "secure_url": secure_url,
        }
    except Exception as e:
        return JSONResponse(content={"message": "Upload error", "error": str(e)})
