import React, { useRef, useState } from "react";
import Layout from "../layout/Layout";
import { FiLogIn } from "react-icons/fi";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useContext } from "react";
import AuthContext from "../context/AuthProvider";
import axios from "../api/axios";
import { toast } from "react-toastify";
import { messageError } from "../api/utils";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdShown, setPwdShown] = useState(false);
  const [confirmPwdShown, setConfirmPwdShown] = useState(false);
  const [emailMsgOut, setEmailMsgOut] = useState("");
  const [passMsgOut, setPassMsgOut] = useState("");
  const [confirmPassMsgOut, setConfirmPassMsgOut] = useState("");
  const [nameMsgOut, setNameMsgOut] = useState("");
  const [registerMsgOut, setRegisterMsgOut] = useState("");
  const { login } = useContext(AuthContext);

  // Loading
  const [isLoading, setIsLoading] = useState(false);

  const togglePassword = () => {
    setPwdShown(!pwdShown);
  };
  const toggleConfirmPassword = () => {
    setConfirmPwdShown(!confirmPwdShown);
  };

  const isValidEmail = (email) => {
    // Sử dụng biểu thức chính quy để kiểm tra định dạng email
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (name === "") {
      setNameMsgOut(`(${messageError.ERROR_INPUT_04})`);
      return;
    } else {
      setNameMsgOut("");
    }

    if (email === "") {
      setEmailMsgOut(`(${messageError.ERROR_INPUT_01})`);
      return;
    } else {
      setEmailMsgOut("");
    }

    if (password === "") {
      setPassMsgOut(`(${messageError.ERROR_INPUT_02})`);
      return;
    } else {
      setPassMsgOut("");
    }

    if (confirmPassword === "") {
      setConfirmPassMsgOut(`(${messageError.ERROR_INPUT_03})`);
      return;
    } else {
      setConfirmPassMsgOut("");
    }

    if (!isValidEmail(email)) {
      setEmailMsgOut(`(${messageError.ERROR_EMAIL_FORMAT})`);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(messageError.ERROR_CONFIRM_PASSWORD);
      return;
    } else {
      setConfirmPassMsgOut("");
    }

    setIsLoading(true);

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    try {
      const payload = {
        name: name,
        email: email,
        password: password,
      };

      const query = await axios.post(
        axios.defaults.baseURL + `/register`,
        payload
      );

      if (query && query.data.success) {
        toast.success(query.data.msg);
        // await login(formData);
        // console.log(query);
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response && error.response.status === 403) {
        toast.error(error.response.data.detail);
      } else if (error.response && error.response.status === 409) {
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

  return (
    <Layout>
      <form className="container mx-auto px-2 mt-16 mb-20 flex-colo">
        <div className="w-full 2xl:w-2/5 gap-6 flex-colo p-8 sm:p-14 md:w-3/5 bg-dry rounded-lg border border-border">
          <img
            src="/image/logo.png"
            alt="logo"
            className="w-full h-12 object-contain"
          />

          <div className="text-sm w-full">
            <label className="text-border font-semibold">
              Full Name <span className="text-subMain">{nameMsgOut}</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Your full name"
              className="w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry"
            />
          </div>

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
              Password <span className="text-subMain">{passMsgOut}</span>
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

          <div className="text-sm w-full relative">
            <label className="text-border font-semibold">
              {" "}
              Confirm Password{" "}
              <span className="text-subMain">{confirmPassMsgOut}</span>
            </label>
            <input
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={confirmPwdShown ? "text" : "password"}
              placeholder="********"
              className="w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry"
            />
            <button
              type="button"
              className="absolute right-4 top-10"
              onClick={toggleConfirmPassword}
            >
              {confirmPwdShown ? (
                <FaEyeSlash className="w-6 h-6" />
              ) : (
                <FaEye className="w-6 h-6" />
              )}
            </button>
          </div>
          <span className="text-subMain">{registerMsgOut}</span>
          <button
            onClick={handleClick}
            className="bg-subMain transitions hover:bg-main flex-rows gap-4 text-white py-4 rounded-lg w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                <FiLogIn /> Sign In
              </>
            )}
          </button>
          <p className="text-center text-border">
            Already have an account?{" "}
            <Link to="/login" className="text-dryGray font-semibold ml-2">
              Log In
            </Link>
          </p>
        </div>
      </form>
    </Layout>
  );
}

export default Register;
