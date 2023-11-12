import hashlib
import hmac
import json
import urllib
import urllib.parse
import urllib.request
import random
import requests
from datetime import datetime

from sqlalchemy import and_
from ..config import settings
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, status
from .. import models, schemas
from .. import vnpayClass
from ..utils import UnicornException, ErrorMessage
from sqlalchemy.orm import Session
from ..database import get_db


router = APIRouter(prefix="/vnpay", tags=["Vnpay"])

msg = ErrorMessage()


def hmacsha512(key, data):
    byteKey = key.encode("utf-8")
    byteData = data.encode("utf-8")
    return hmac.new(byteKey, byteData, hashlib.sha512).hexdigest()


def get_client_ip(request: Request):
    client_ip = request.client.host
    return client_ip


@router.post("/payment")
async def payment(
    form: schemas.PaymentForm, request: Request, db: Session = Depends(get_db)
):
    try:
        if form:
            order_type = form.order_type
            order_id = form.order_id
            amount = form.amount
            order_desc = form.order_desc
            bank_code = form.bank_code
            language = form.language
            ipaddr = get_client_ip(request)

            payment = (
                db.query(models.Payment)
                .filter(
                    and_(models.Payment.id == order_id, models.Payment.pay == amount)
                )
                .first()
            )

            if not payment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=msg.PAYMENT_NOT_FOUND,
                )
            if payment.status == 1:
                return {"success": False, "msg": msg.PAYMENT_ERROR_03}

            # Build URL Payment
            vnp = vnpayClass.vnpay()
            vnp.requestData["vnp_Version"] = "2.1.0"
            vnp.requestData["vnp_Command"] = "pay"
            vnp.requestData["vnp_TmnCode"] = settings.vnpay_tmn_code
            vnp.requestData["vnp_Amount"] = amount * 100
            vnp.requestData["vnp_CurrCode"] = "VND"
            vnp.requestData["vnp_TxnRef"] = order_id
            vnp.requestData["vnp_OrderInfo"] = order_desc
            vnp.requestData["vnp_OrderType"] = order_type

            # Check language, default: vn
            if language and language != "":
                vnp.requestData["vnp_Locale"] = language
            else:
                vnp.requestData["vnp_Locale"] = "vn"
                # Check bank_code, if bank_code is empty, customer will be selected bank on VNPAY
            if bank_code and bank_code != "":
                vnp.requestData["vnp_BankCode"] = bank_code

            vnp.requestData["vnp_CreateDate"] = datetime.now().strftime(
                "%Y%m%d%H%M%S"
            )  # 20150410063022
            vnp.requestData["vnp_IpAddr"] = ipaddr
            vnp.requestData["vnp_ReturnUrl"] = settings.vnpay_return_url
            vnpay_payment_url = vnp.get_payment_url(
                settings.vnpay_payment_url, settings.vnpay_hash_secret_key
            )
            print(vnpay_payment_url)
            return {
                "success": True,
                "msg": msg.VNPAY_VALID_SUCCESS,
                "url": vnpay_payment_url,
            }
        else:
            return {
                "success": False,
                "msg": msg.VNPAY_VALID_ERROR,
            }
    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )


@router.get("/payment-return")
def payment_return(
    request: Request,
    db: Session = Depends(get_db),
):
    try:
        vnp = vnpayClass.vnpay()
        inputData = dict(request.query_params)
        vnp.responseData = inputData

        order_id = inputData["vnp_TxnRef"]
        amount = int(inputData["vnp_Amount"]) / 100
        order_desc = inputData["vnp_OrderInfo"]
        vnp_TransactionNo = inputData["vnp_TransactionNo"]
        vnp_ResponseCode = inputData["vnp_ResponseCode"]
        vnp_TmnCode = inputData["vnp_TmnCode"]
        vnp_PayDate = inputData["vnp_PayDate"]
        vnp_BankCode = inputData["vnp_BankCode"]
        vnp_CardType = inputData["vnp_CardType"]

        if vnp.validate_response(settings.vnpay_hash_secret_key):
            if vnp_ResponseCode == "00":
                query = db.query(models.Payment).filter(
                    and_(models.Payment.id == order_id, models.Payment.pay == amount)
                )
                payment = query.first()
                if not payment:
                    return HTMLResponse(
                        content="""
                            <html>
                                <body>
                                    <h1>Payment Information Error</h1>
                                    <p>Payment information isn't correct.</p>
                                </body>
                            </html>
                        """
                    )
                if payment.status == 1:
                    return HTMLResponse(
                        content="""
                            <html>
                                <body>
                                    <h1>Payment Already Updated</h1>
                                    <p>Payment has already been updated.</p>
                                </body>
                            </html>
                        """
                    )

                update_data = {"status": 1}
                query.update(update_data, synchronize_session=False)
                db.commit()

                return HTMLResponse(
                    content=f"""
                            <html>
                                <body>
                                    <h1>Payment Successful</h1>
                                    <p>Payment successful for order ID: {order_id}</p>
                                    <p>Amount: {amount}</p>
                                    <p>Order Description: {order_desc}</p>
                                    <p>Transaction Number: {vnp_TransactionNo}</p>
                                    <p>Response Code: {vnp_ResponseCode}</p>
                                </body>
                            </html>
                        """
                )
            elif vnp_ResponseCode == "24":
                query = db.query(models.Payment).filter(
                    and_(models.Payment.id == order_id, models.Payment.pay == amount)
                )
                payment = query.first()
                if not payment:
                    return HTMLResponse(
                        content="""
                            <html>
                                <body>
                                    <h1>Payment Information Error</h1>
                                    <p>Payment information isn't correct.</p>
                                </body>
                            </html>
                        """
                    )
                if payment.status == 1:
                    return HTMLResponse(
                        content="""
                            <html>
                                <body>
                                    <h1>Payment Already Updated</h1>
                                    <p>Payment has already been updated.</p>
                                </body>
                            </html>
                        """
                    )

                db.delete(payment)
                db.commit()

                return HTMLResponse(
                    content=f"""
                            <html>
                                <body>
                                    <h1>Cancel Payment</h1>
                                    <p>Payment with order ID: {order_id}.</p>
                                    <p>Amount: {amount}</p>
                                    <p>Order Description: {order_desc}</p>
                                    <p>Transaction Number: {vnp_TransactionNo}</p>
                                    <p>Response Code: {vnp_ResponseCode}</p>
                                </body>
                            </html>
                         """
                )
            else:
                return HTMLResponse(
                    content=f"""
                            <html>
                                <body>
                                    <h1>Invalid Signature</h1>
                                    <p>Payment with order ID: {order_id} has an invalid signature.</p>
                                    <p>Amount: {amount}</p>
                                    <p>Order Description: {order_desc}</p>
                                    <p>Transaction Number: {vnp_TransactionNo}</p>
                                    <p>Response Code: {vnp_ResponseCode}</p>
                                </body>
                            </html>
                         """
                )
        else:
            return {
                "success": True,
                "msg": msg.VNPAY_INVALID_SIGN,
                "payment": {
                    "order_id": order_id,
                    "amount": amount,
                    "order_desc": order_desc,
                    "vnp_TransactionNo": vnp_TransactionNo,
                    "vnp_ResponseCode": vnp_ResponseCode,
                },
            }
    except HTTPException as e:
        raise UnicornException(
            status_code=e.status_code, detail=e.detail, success=False
        )
