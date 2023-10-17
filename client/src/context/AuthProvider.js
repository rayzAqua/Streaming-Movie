import axios from "../api/axios";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => { 
  const [user, setUser] = useState(() => {
    if (localStorage.getItem("tokens")) {
      let tokens = JSON.parse(localStorage.getItem("tokens"));
      return tokens.userInfo.name;
    }
    return null;
  });

  const navigate = useNavigate();
 
  const login = async (payload) => {
      const apiResponse = await axios.post(axios.defaults.baseURL + "/login", payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (apiResponse.data.status === true && apiResponse.data.userInfo !=0) {
        localStorage.setItem("tokens", JSON.stringify(apiResponse.data));
        if(apiResponse.data.userInfo.status ==2) window.location.href = "/verify-code";
        else if(apiResponse.data.userInfo.status==3) window.location.href = "/change-pass";
        else window.location.href = "/"; 
      }

  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("tokens");
    localStorage.removeItem("payment");
    // navigate("/login");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

 
export default AuthContext;