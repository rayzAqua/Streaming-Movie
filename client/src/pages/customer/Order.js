import React, { useEffect, useState } from "react";
import Layout from "../../layout/Layout";
import { useRentMovieContext } from "../../context/RentMovieProvider";
import axios from "../../api/axios";
import { toast } from "react-toastify";
import axiosApiInstance from "../../context/intercepter";
import { useNavigate } from "react-router-dom";
import { getUserPayment } from "../../api/utils";

const Order = () => {
  const navigate = useNavigate();
  const [rentData, setRentData] = useRentMovieContext();
  const [loading, setLoading] = useState(false);

  // Payment data
  const [paymentData, setPaymentData] = useState(() => {
    if (
      rentData.order_id ||
      rentData.total ||
      rentData.package_name ||
      rentData.customer ||
      rentData.email
    ) {
      return {
        order_id: rentData.order_id.toString(),
        order_type: "billpayment",
        amount: rentData.total,
        order_desc: rentData.package_name,
        bank_code: null,
        language: null,
      };
    }
    return null;
  });

  const handleSubmit = async () => {
    try {
      if (paymentData) {
        // Gửi yêu cầu thanh toán.
        const res = await axios.post(
          `${axios.defaults.baseURL}/vnpay/payment`,
          paymentData
        );

        if (res && res.data.success) {
          console.log(res.data.msg);
          window.open(res.data.url, "_blank");
          toast.warning(`Please payment.`);
          // Liên tục kiểm tra trạng thái thanh toán sau một khoảng thời gian.
          const orderId = paymentData.order_id;
          const checkInterval = setInterval(async () => {
            const check = await axiosApiInstance.get(
              `${axios.defaults.baseURL}/payment/checkPaymentSuccess/${orderId}`
            );
            if (check && check.data.success) {
              toast.success(check.data.msg);
              clearInterval(checkInterval);
              localStorage.removeItem("rentData");
              await getUserPayment();
              if (rentData.movie_title) {
                window.location.href = `/movie/${rentData.movie_title}`;
              } else {
                window.location.href = `/package`;
              }
            } else {
              if (check.data.isCancel) {
                console.log(check);
                clearInterval(checkInterval);
                localStorage.removeItem("rentData");
                if (rentData.movie_title) {
                  window.location.href = `/movie/${rentData.movie_title}`;
                } else {
                  window.location.href = `/package`;
                }
              } else {
                console.log(check.data.msg);
              }
            }
          }, 5000);
        } else {
          // Thanh toán rồi  mà còn gửi lại yêu cầu thanh toán thì chạy vào đây.
          toast.warning(`${res.data.msg}. Waiting for redirect.`);
          localStorage.removeItem("rentData");
          setTimeout(() => {
            if (rentData.movie_title) {
              window.location.href = `/movie/${rentData.movie_title}`;
            } else {
              window.location.href = `/package`;
            }
          }, 2000);
        }
      } else {
        toast.error("Invalid payment infomation.");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.error(error.response.data.detail);
      } else if (error.response && error.response.status === 422) {
        toast.error(error.response.data.detail[0].msg);
      } else if (error.response && error.response.status === 500) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Something is wrong.");
      }
    }
  };

  const handleCancel = async () => {
    try {
      if (paymentData) {
        setLoading(true);
        const res = await axiosApiInstance.delete(
          `${axios.defaults.baseURL}/payment/delete/${paymentData.order_id}`,
          paymentData
        );

        if (res && res.data.success) {
          console.log(res.data.msg);
          localStorage.removeItem("rentData");
          toast.warning(`${res.data.msg}. Waiting for redirect.`);
          if (rentData.movie_title) {
            window.location.href = `/movie/${rentData.movie_title}`;
          } else {
            window.location.href = `/package`;
          }
        } else {
          toast.warning(`${res.data.msg}. Waiting for redirect.`);
          localStorage.removeItem("rentData");
          setTimeout(() => {
            if (rentData.movie_title) {
              window.location.href = `/movie/${rentData.movie_title}`;
            } else {
              window.location.href = `/package`;
            }
          }, 2000);
        }
      } else {
        toast.error("Invalid payment infomation.");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 404) {
        toast.error(error.response.data.detail);
      } else if (error.response && error.response.status === 422) {
        toast.error(error.response.data.detail[0].msg);
      } else if (error.response && error.response.status === 500) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Something is wrong.");
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-2 mt-16 mb-20 flex-colo">
        <div className="w-full 2xl:w-2/5 gap-6 flex-colo p-14 md:w-3/5 bg-dry rounded-lg border border-border">
          {paymentData ? (
            <>
              <h3 className="text-2xl font-semibold mb-4">
                Confirm Payment Information
              </h3>

              <div className="text-sm w-full">
                <div className="mb-4">
                  <label className="text-border font-semibold">Your Name</label>
                  <input
                    id="order_id"
                    name="order_id"
                    type="text"
                    className="w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry"
                    value={rentData.customer}
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label className="text-border font-semibold">Email</label>
                  <input
                    id="order_id"
                    name="order_id"
                    type="text"
                    className="w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry"
                    value={rentData.email} // Giá trị mặc định tại đây
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label className="text-border font-semibold">OrderID</label>
                  <input
                    id="order_id"
                    name="order_id"
                    type="text"
                    className="w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry"
                    value={paymentData.order_id} // Giá trị mặc định tại đây
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label className="text-border font-semibold">
                    Order Details
                  </label>
                  <textarea
                    cols="20"
                    id="order_desc"
                    name="order_desc"
                    rows="2"
                    className="w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry"
                    value={paymentData.order_desc}
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label className="text-border font-semibold">Total</label>
                  <input
                    id="amount"
                    name="amount"
                    type="text"
                    className="w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry"
                    value={`${paymentData.amount.toLocaleString("VN-vi")} VND`}
                    readOnly
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className="bg-subMain transitions hover:bg-main flex-rows gap-4 text-white py-4 rounded-lg w-full"
                  disabled={loading}
                >
                  Payment
                </button>

                <button
                  onClick={handleCancel}
                  className="bg-darkBlue transitions hover:bg-main flex-rows gap-4 text-white py-4 rounded-lg w-full mt-4"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <h3 className="text-2xl font-semibold mb-4">
              Invalid Payment Infomation
            </h3>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Order;
