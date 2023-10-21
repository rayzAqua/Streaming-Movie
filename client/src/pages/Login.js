import React, { useContext, useState } from "react";
import Layout from "../layout/Layout";
import { FiLogIn } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "../api/axios"; // Import your axios instance here
import AuthContext from "../context/AuthProvider";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const [emailMsgOut, setEmailMsgOut] = useState("");
  const [passwordMsgOut, setpasswordMsgOut] = useState("");
  const [loginMsgOut, setLoginMsgOut] = useState("");

  const [pwdShown, setPwdShown] = useState(false);

  const togglePassword = () => {
    setPwdShown(!pwdShown);
  };

  const isValidEmail = (email) => {
    // Sử dụng biểu thức chính quy để kiểm tra định dạng email
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailMsgOut("");
    setpasswordMsgOut("");
    setLoginMsgOut("");

    if (email === "" || password === "") {
      if (email === "") {
        setEmailMsgOut("(PLEASE INPUT YOUR EMAIL)");
      }
      if (password === "") {
        setpasswordMsgOut("(PLEASE INPUT YOUR PASSWORD)");
      }
      return;
    }

    if (!isValidEmail(email)) {
      setEmailMsgOut("(INVALID EMAIL FORMAT)");
      return;
    }

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      await login(formData);
      setLoginMsgOut("");
    } catch (error) {
      setLoginMsgOut("EMAIL OR PASSWORD IS INCORRECT");
    }
  };
  return (
    <Layout>
      <form className="container mx-auto px-2 mt-16 mb-20 flex-colo">
        <div className="w-full 2xl:w-2/5 gap-6 flex-colo p-14 md:w-3/5 bg-dry rounded-lg border border-border">
          <img
            src="/image/logo.png"
            alt="logo"
            className="w-full h-12 object-contain"
          />
          <div className="text-sm w-full">
            <label className="text-border font-semibold">
              Email <span className="text-subMain">{emailMsgOut}</span>
            </label>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="NetMovie@gmail.com"
              className="w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry"
            />
          </div>

          <div className="text-sm w-full relative">
            <label className="text-border font-semibold">
              Password <span className="text-subMain">{passwordMsgOut}</span>
            </label>
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={pwdShown ? "text" : "password"}
              placeholder="********"
              className="w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry"
            />
            <button
              type="button"
              className="absolute right-4 top-10"
              onClick={togglePassword}
            >
              {pwdShown ? (
                <FaEyeSlash className="w-6 h-6" />
              ) : (
                <FaEye className="w-6 h-6" />
              )}
            </button>
          </div>
          <span className="text-subMain">{loginMsgOut}</span>
          <button
            type="button"
            onClick={handleLogin}
            className="bg-subMain transitions hover:bg-main flex-rows gap-4 text-white py-4 rounded-lg w-full"
          >
            <FiLogIn /> Sign In
          </button>
          <p className="text-center text-border">
            Don't have an account?{" "}
            <Link to="/register" className="text-dryGray font-semibold ml-2">
              Sign Up
            </Link>
          </p>
          <p className="text-center text-border">
            <Link to="/forgot-pass" className="text-dryGray font-semibold ml-2">
              Forgot password?
            </Link>
          </p>
        </div>
      </form>
    </Layout>
  );
}

export default LoginPage;
