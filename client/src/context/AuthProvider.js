import axios from "../api/axios";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosApiInstance from "./intercepter";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (localStorage.getItem("tokens")) {
      let tokens = JSON.parse(localStorage.getItem("tokens"));
      return tokens.userInfo.name;
    }
    return null;
  });

  const login = async (payload) => {
    try {
      const apiResponse = await axios.post(
        axios.defaults.baseURL + "/login",
        payload,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (apiResponse && apiResponse.data.success) {
        localStorage.setItem("tokens", JSON.stringify(apiResponse.data.user));
        toast.success("Login successfuly!");
        window.location.href = "/";
      } else {
        toast.warning(apiResponse.data.msg);
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        toast.error(error.response.data.detail);
      } else if (error.response && error.response.status === 422) {
        toast.error(error.response.data.detail[0].ctx.reason);
      } else if (error.response && error.response.status === 500) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Something is wrong.");
      }
    }
  };

  const logout = async () => {
    setUser(null);
    const data = JSON.parse(localStorage.getItem("rentData"));

    if (data.order_id) {
      const res = await axiosApiInstance.delete(
        `${axios.defaults.baseURL}/payment/delete/${data.order_id}`
      );
      if (res && res.data.success) {
        console.log(res.data.msg);
        localStorage.removeItem("rentData");
      } else {
        localStorage.removeItem("rentData");
      }
    } else {
      console.log("Invalid payment infomation.");
    }

    localStorage.removeItem("tokens");
    localStorage.removeItem("payment");
    setTimeout(() => {
      window.location.href = "/login";
    }, 500);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
