import axios from "../api/axios";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
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
    localStorage.removeItem("tokens");
    localStorage.removeItem("payment");
    localStorage.removeItem("rentData");
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
