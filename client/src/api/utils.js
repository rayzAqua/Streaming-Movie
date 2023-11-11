import { toast } from "react-toastify";
import axiosApiInstance from "../context/intercepter";

export const getUserPayment = async () => {
  try {
    const res = await axiosApiInstance.get(
      axiosApiInstance.defaults.baseURL + `/payment/getNewestPayment`
    );

    if (res && res.data.success) {
      console.log(res.data.msg);
    } else {
      console.log(res.data.msg);
    }
    localStorage.setItem("payment", JSON.stringify(res.data.package));
  } catch (error) {
    if (error.response && error.response.status === 422) {
      toast.error(error.response.data.detail[0].msg);
    } else if (error.response && error.response.status === 500) {
      toast.error(error.response.data.detail);
    } else {
      toast.error("Something is wrong.");
    }
  }
};

export const messageError = {
  ERROR_CONFIRM_PASSWORD: "Password and confirm password are not match",
  ERROR_EMAIL_FORMAT: "INVALID EMAIL FORMAT",

  ERROR_INPUT_01: "PLEASE INPUT YOUR EMAIL",
  ERROR_INPUT_02: "PLEASE INPUT YOUR PASSWORD",
  ERROR_INPUT_03: "PLEASE CONFIRM YOUR PASSWORD",
  ERROR_INPUT_04: "PLEASE INPUT YOUR NAME",
  ERROR_INPUT_05: "PLEASE INPUT CODE",
};
