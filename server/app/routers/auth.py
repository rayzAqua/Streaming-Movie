"""
    Router Authorize
"""

from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy import and_
from sqlalchemy.orm import Session
from fastapi_mail import FastMail, ConnectionConfig
from datetime import datetime, timedelta
from .. import database, schemas, models, utils, oauth2
from ..database import get_db
from ..config import settings
from ..utils import UnicornException, sendConfirmCodeEmail, sendVerifyEmail
from jose import jwt
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

msg = utils.ErrorMessage()


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
                detail=msg.LOGIN_ERROR_EMAIL,
            )
        # Check password
        if not await utils.verify(user_credentials.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=msg.LOGIN_ERROR_PASSWORD,
            )
        # Check status
        if not user.status:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=msg.LOGIN_ERROR_LOCKED,
            )
        # Check verify
        if not user.verified:
            # send mail
            token = (
                db.query(models.Token).filter(models.Token.user_id == user.id).first()
            )
            if not token:
                # Send verify email
                await sendVerifyEmail(dbSession=db, userData=user)
                return {
                    "success": False,
                    "msg": msg.VERIFY_WARNING_01,
                }
            else:
                return {
                    "success": False,
                    "msg": msg.VERIFY_WARNING_02,
                }

        # CREATE A TOKEN
        # Role
        if user.isAdmin:
            role = "ADMIN"
        else:
            role = "CUSTOMER"
        # Generate a access token
        access_token = oauth2.create_access_token(
            data={"user_id": str(user.id), "role": role}
        )
        userInfo = {
            "name": user.name,
            "role": role,
        }
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        return {
            "success": True,
            "user": {
                "userInfo": userInfo,
                "token_type": "bearer",
                "access_token": access_token,
                "expiresIn": expire,
            },
            "msg": msg.LOGIN_SUCCESS,
        }

    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


@router.post("/register")
async def register(user: schemas.Register, db: Session = Depends(get_db)):
    try:
        check_user = (
            db.query(models.User).filter(models.User.email == user.email).first()
        )
        if check_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=msg.REGISTER_ERROR_EMAIL,
            )

        if len(user.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=msg.REGISTER_ERROR_PASSWORD,
            )
        # Empty name validate
        if user.name == "":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=msg.REGISTER_ERROR_FULLNAME_01,
            )
        # Lenght of name valiđate
        if len(user.name) > 32:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=msg.REGISTER_ERROR_FULLNAME_02,
            )

        # Tạo một bản ghi User mới với trạng thái verify (status = 2)
        hashed_password = await utils.hash(user.password)
        new_user = models.User(
            email=user.email, password=hashed_password, name=user.name
        )

        # Lưu thông tin người dùng vào cơ sở dữ liệu (sử dụng tham số db)
        db.add(new_user)
        # Tạm thời lưu vào csdl
        db.flush()

        # XÁC THỰC EMAIL
        await sendVerifyEmail(dbSession=db, userData=new_user)

        return {
            "success": True,
            "msg": msg.REGISTER_SUCCESS,
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
            parts = user_token.split(".")
            if len(parts) != 3:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=msg.VERIFY_ERROR_TOKEN,
                )
            user_data = jwt.decode(
                user_token, settings.secret_key, algorithms=settings.algorithm
            )
        except ExpiredSignatureError:
            # Nếu JWT đã hết hẹn thì truy vấn đến verify token trong db.
            # Mục đích: Mỗi verify link chỉ đc mở form resend-email một lần duy nhất, nếu lỡ tắt link mới nhất thì đc mở lại.
            on_check = (
                db.query(models.Token)
                .filter(models.Token.token == verify_token)
                .first()
            )
            if on_check and on_check.token == verify_token:
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
                                        <button type="button" onclick="sendEmail()" id="resend-button">Resend Email</button>
                                        <div id="countdown-timer"></div>
                                    </form>

                                    <script>
                                        let isResendButtonDisabled = false;
                                        let countdownSeconds = 120;
                                        let countdownInterval;

                                        function updateCountdownTimer(countdownTimer) {

                                            // Hiển thị thời gian đếm ngược dưới dạng phút và giây
                                            const minutes = Math.floor(countdownSeconds / 60);
                                            const seconds = countdownSeconds % 60;
                                            countdownTimer.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
                                        }
                                        
                                        function disableResendButton() {
                                            isResendButtonDisabled = true;
                                            const resendButton = document.getElementById("resend-button");
                                            resendButton.disabled = true;
                                        }
    
                                        function enableResendButton() {
                                            isResendButtonDisabled = false;
                                            const resendButton = document.getElementById("resend-button");
                                            resendButton.disabled = false;
                                        }
                                        
                                        function sendEmail() {
                                            if (isResendButtonDisabled) {
                                                return;
                                            }
                                            
                                            const emailInput = document.getElementById("email");
                                            const emailValue = emailInput.value;
                                            const responseMessage = document.getElementById("response-message");
                                            const countdownTimer = document.getElementById("countdown-timer");

                                            if (!emailValue || emailValue === "") {
                                                responseMessage.textContent = "Email is required";
                                                return;
                                            } else {
                                                responseMessage.textContent = "";
                                            }
                                            
                                            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

                                            if (!emailPattern.test(emailValue)) {
                                                responseMessage.textContent = "Invalid email format";
                                                return;
                                            } else {
                                                responseMessage.textContent = "";
                                            }
                                                                                                                                 
                                            const formData = { email: emailValue };

                                            disableResendButton()
                                            
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
                                                    clearInterval(countdownInterval); // Dừng đếm ngược hiện tại
                                                    countdownSeconds = 120; // Reset thời gian đếm ngược
                                                    // disableResendButton(); // Cho phép nhấn lại
                                                    updateCountdownTimer(countdownTimer);
                                                    countdownInterval = setInterval(() => {
                                                        countdownSeconds--;
                                                        console.log(countdownSeconds--)

                                                        if (countdownSeconds <= 1) {
                                                            enableResendButton()
                                                            countdownTimer.textContent = "";
                                                            clearInterval(countdownInterval);
                                                        } else {
                                                            updateCountdownTimer(countdownTimer);
                                                        }
                                                    }, 1000);
                                                } else {
                                                    responseMessage.textContent = `Resend failed: ${data.detail}`;
                                                    enableResendButton(); // Cho phép nhấn lại
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
            else:
                return HTMLResponse(content="<h2>Invalid Link</h2>")

        # Kiểm tra user từ user_data
        user_query = db.query(models.User).filter(
            and_(
                models.User.id == user_data["user_id"],
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
                    models.Token.user_id == stored_user.id,
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

        return {"success": True, "msg": msg.VERIFY_SUCCESS}

    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


@router.post("/resend-email")
async def resendEmail(
    email_data: schemas.EmailInput,
    db: Session = Depends(get_db),
):
    try:
        user = (
            db.query(models.User).filter(models.User.email == email_data.email).first()
        )
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=msg.EMAIL_ERROR_01
            )
        if user.verified:
            raise HTTPException(
                status_code=status.HTTP_406_NOT_ACCEPTABLE, detail=msg.VERIFY_WARNING_03
            )

        isExistedToken = (
            db.query(models.Token).filter(models.Token.user_id == user.id).first()
        )
        if isExistedToken:
            db.delete(isExistedToken)
            db.commit()
            # raise HTTPException(
            #     status_code=status.HTTP_409_CONFLICT, detail="Email was sent."
            # )

        # Send verify email
        await sendVerifyEmail(dbSession=db, userData=user)

        return {"success": True, "msg": msg.RESEND_EMAIL_SUCCESS}

    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


@router.post("/forget-password")
async def forgetPassword(email_user: schemas.EmailInput, db: Session = Depends(get_db)):
    try:
        user = (
            db.query(models.User).filter(models.User.email == email_user.email).first()
        )
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=msg.FORGET_ERROR_EMAIL
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
                    "success": False,
                    "msg": msg.FORGET_EXISTED_CODE,
                }

        # Nếu user chưa có mã thì gửi mã xác nhận email
        await sendConfirmCodeEmail(user.email)

        return {
            "success": True,
            "msg": msg.FORGET_SUCCESS_01,
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
                status_code=status.HTTP_404_NOT_FOUND, detail=msg.FORGET_ERROR_EMAIL
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
                        "msg": msg.FORGET_SUCCESS_02,
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
                        "msg": msg.FORGET_EXPIRED_CODE,
                    }
            # Nếu mã không đúng
            else:
                return {
                    "success": False,
                    "isCorrect": False,
                    "msg": msg.FORGET_ERROR_CODE,
                }
        else:
            return {
                "success": False,
                "isCorrect": False,
                "msg": msg.FORGET_ERROR_DATA_01,
            }

    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


@router.post("/change-password")
async def change_pass(
    data: schemas.ChangePassword,
    db: Session = Depends(get_db),
):
    try:
        query = db.query(models.User).filter(models.User.email == data.email)
        user = query.first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=msg.FORGET_ERROR_EMAIL
            )

        if len(data.new_password) < 6:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=msg.FORGET_ERROR_PASSWORD,
            )

        if data.isCorrect:
            hashed_password = await utils.hash(data.new_password)
            update_data = {"password": hashed_password}
            query.update(update_data, synchronize_session=False)  # type: ignore
            db.commit()
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=msg.FORGET_ERROR_DATA_02,
            )

        return {
            "success": True,
            "msg": msg.FORGET_SUCCESS_03,
        }
    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )
