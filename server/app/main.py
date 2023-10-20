"""
    Main
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from . import models
from .database import engine
from .routers import user, auth, films, upload, genres, actors, pricing, payment, vnpay
from .config import settings
from fastapi.middleware.cors import CORSMiddleware
from .utils import UnicornException

app = FastAPI(title="MOVIE STREAMING API")

# Cấu hình CORS
origins = [
    "http://localhost:3000",  # Thay thế bằng địa chỉ của ứng dụng React của bạn
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)


app.include_router(auth.router)
app.include_router(user.router)
app.include_router(films.router)
app.include_router(genres.router)
app.include_router(pricing.router)
app.include_router(actors.router)
app.include_router(payment.router)
app.include_router(upload.router)
app.include_router(vnpay.router)


@app.get("/")
def root():
    return {"message": "Welcome to my API server"}


# Handle Error
@app.exception_handler(UnicornException)
async def unicorn_exception_handler(request: Request, exc: UnicornException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": exc.success, "detail": exc.detail},
    )
