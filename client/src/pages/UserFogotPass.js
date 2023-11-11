import React, { useEffect, useState } from "react";
import Layout from "../layout/Layout";
import axios from "../api/axios";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { messageError } from "../api/utils";

function UserFogotPass() {
  const navigate = useNavigate();
  // Open find email form
  const [openMailInput, setOpenMailInput] = useState(true);
  const [email, setEmail] = useState("");
  const [emailMsgOut, setEmailMsgOut] = useState("");

  // Open confirm code form
  const [openConfirmCode, setOpenConfirmcode] = useState(false);
  const [code, setCode] = useState("");
  const [codeMsgOut, setCodeMsgOut] = useState("");

  // Open change password form
  const [isCorrectCode, setIsCorrectCode] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passMsgOut, setPassMsgOut] = useState("");
  const [confirmPassMsgOut, setConfirmPassMsgOut] = useState("");
  const [pwdShown, setPwdShown] = useState(false);
  const [confirmPwdShown, setConfirmPwdShown] = useState(false);

  // Loading
  const [isLoading, setIsLoading] = useState(false);

  // Reload
  useEffect(() => {
    const user_email = localStorage.getItem("user_email");
    const isCorrectCode = localStorage.getItem("isCorrect");

    if (!user_email && !isCorrectCode) {
      setOpenMailInput(true);
    } else if (user_email && !isCorrectCode) {
      const parsedData = JSON.parse(user_email);

      // Set email.
      setEmail(parsedData);
      // Unopen mail input form.
      setOpenMailInput(false);
      // Open code input form.
      setOpenConfirmcode(true);
    } else {
      const parsedData1 = JSON.parse(user_email);
      const parsedData2 = JSON.parse(isCorrectCode);

      // Set email.
      setEmail(parsedData1);
      // Unopen mail input form.
      setOpenMailInput(false);
      // Unppen code input form.
      setOpenConfirmcode(false);
      // Open changepassword form.
      setIsCorrectCode(parsedData2);
    }
  }, []);

  const isValidEmail = (email) => {
    // Sử dụng biểu thức chính quy để kiểm tra định dạng email
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  // Handle find email
  const handleFindEmail = async (e) => {
    e.preventDefault();

    if (email === "") {
      setEmailMsgOut(`(${messageError.ERROR_INPUT_01})`);
      return;
    } else {
      setEmailMsgOut("");
    }

    if (!isValidEmail(email)) {
      setEmailMsgOut(`(${messageError.ERROR_EMAIL_FORMAT})`);
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email: email,
      };
      const res = await axios.post(
        axios.defaults.baseURL + `/forget-password`,
        payload
      );

      if (res && res.data.success === true) {
        toast.success(res.data.msg);
        // Unopen email form.
        setOpenMailInput(false);
        // Open code input form.
        setOpenConfirmcode(true);
        // Set email into localstorage.
        localStorage.setItem("user_email", JSON.stringify(email));
      } else {
        toast.warning(res.data.msg);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      if (error.response && error.response.status === 404) {
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

  // Handle confirm code
  const handleConfirmCode = async (e) => {
    e.preventDefault();

    if (code === "") {
      setCodeMsgOut(`(${messageError.ERROR_INPUT_05})`);
      return;
    } else {
      setCodeMsgOut("");
    }

    setIsLoading(true);

    try {
      const payload = {
        email: email,
        code: code,
      };
      const res = await axios.post(
        axios.defaults.baseURL + `/confirm-code`,
        payload
      );

      if (res && res.data.success) {
        toast.success(res.data.msg);
        // Set isCorrect code if it's a right code
        if (res.data.isCorrect) {
          // Unopen code input form
          setOpenConfirmcode(false);
          localStorage.setItem("isCorrect", JSON.stringify(res.data.isCorrect));
          // Open change password form
          setIsCorrectCode(res.data.isCorrect);
        } else {
          toast.error("Something is wrong.");
        }
      } else {
        toast.warning(res.data.msg);
        // Set False
        setIsCorrectCode(res.data.isCorrect);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      if (error.response && error.response.status === 404) {
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

  const togglePassword = () => {
    setPwdShown(!pwdShown);
  };

  const toggleConfirmPassword = () => {
    setConfirmPwdShown(!confirmPwdShown);
  };

  // Handle change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

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

    if (password != confirmPassword) {
      toast.error(messageError.ERROR_CONFIRM_PASSWORD);
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        isCorrect: isCorrectCode,
        email: email,
        new_password: password,
      };
      const res = await axios.post(
        axios.defaults.baseURL + `/change-password`,
        payload
      );

      if (res && res.data.success) {
        toast.success(res.data.msg);
        localStorage.removeItem("user_email");
        localStorage.removeItem("isCorrect");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.warning(res.data.msg);
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response && error.response.status === 403) {
        toast.error(error.response.data.detail);
      } else if (error.response && error.response.status === 404) {
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
        <div className="w-full 2xl:w-2/5 gap-6 flex-colo p-14 md:w-3/5 bg-dry rounded-lg border border-border">
          <img
            src="/image/logo.png"
            alt="logo"
            className="w-full h-12 object-contain"
          />
          <div className="text-sm w-full">
            {openMailInput && (
              <>
                <label className="text-border font-semibold">
                  Email<span className="text-subMain">{emailMsgOut}</span>
                </label>
                <input
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="NetMovie@gmail.com"
                  className="w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry"
                />
              </>
            )}
            {openConfirmCode && (
              <>
                <label className="text-border font-semibold">
                  Email<span className="text-subMain">{emailMsgOut}</span>
                </label>
                <div className="w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry">
                  {email}
                </div>

                <div className="mt-2">
                  <label className="text-border font-semibold">
                    Confirm Code
                    <span className="text-subMain">{codeMsgOut}</span>
                  </label>
                  <input
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    type="text"
                    placeholder=""
                    className="w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry"
                  />
                </div>
              </>
            )}

            {isCorrectCode && (
              <>
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

                <div className="text-sm w-full relative mt-2">
                  <label className="text-border font-semibold">
                    Confirm Password
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
              </>
            )}
          </div>

          {openMailInput && (
            <button
              onClick={handleFindEmail}
              className="bg-subMain transitions hover:bg-main flex-rows gap-4 text-white py-4 rounded-lg w-full"
              disabled={isLoading ? true : false}
            >
              {isLoading ? "Loading..." : "Find Your Email"}
            </button>
          )}

          {openConfirmCode && (
            <button
              onClick={handleConfirmCode}
              className="bg-subMain transitions hover:bg-main flex-rows gap-4 text-white py-4 rounded-lg w-full"
              disabled={isLoading ? true : false}
            >
              {isLoading ? "Loading..." : "Verify Code"}
            </button>
          )}

          {isCorrectCode && (
            <button
              onClick={handleChangePassword}
              className="bg-subMain transitions hover:bg-main flex-rows gap-4 text-white py-4 rounded-lg w-full"
              disabled={isLoading ? true : false}
            >
              {isLoading ? "Loading..." : "Confirm"}
            </button>
          )}
        </div>
      </form>
    </Layout>
  );
}

export default UserFogotPass;
