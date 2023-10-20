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
