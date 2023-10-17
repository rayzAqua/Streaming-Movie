import axios from "../api/axios";
import { toast } from "react-toastify";

const axiosApiInstance = axios.create({});

axiosApiInstance.interceptors.request.use((config) => {
  let tokensData = JSON.parse(localStorage.getItem("tokens"));
  if (!tokensData) {
    toast.info("Vui lòng đăng nhập để tiếp tục!", { autoClose: 3000 });
    window.location.href = "/login";
  } else {
    const dateToCompare = new Date(tokensData.expiresIn); // Ngày cần so sánh
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (today >= dateToCompare) {
      toast.info("Vui lòng đăng nhập để tiếp tục!", { autoClose: 3000 });
      window.location.href = "/login";
    } else {
      config.headers = {
        Authorization: `${tokensData.token_type} ${tokensData.access_token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      };
    }
  }
  return config;
});

axiosApiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
      window.location.href = "/login";
    }
    throw error;
  }
);

export default axiosApiInstance;
