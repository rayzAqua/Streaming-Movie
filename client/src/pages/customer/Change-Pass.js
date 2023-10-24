import React, { useState, useRef, useContext } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import SideBar from "../../components/nav/SideBar";
import { toast } from "react-toastify";
import axiosApiInstance from "../../context/intercepter";
import AuthContext from "../../context/AuthProvider";

function ChangePass() {
  //   const oldPass = useRef("");
  //   const newPass = useRef("");
  //   const configNewPass = useRef("");

  const [oldPwdShown, setOldPwdShown] = useState(false);
  const [newPwdShown, setNewPwdShown] = useState(false);
  const [confirmPwdShown, setConfirmPwdShown] = useState(false);

  const [currPassword, setCurrPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currPassMsgOut, setCurrPassMsgOut] = useState("");
  const [passMsgOut, setPassMsgOut] = useState("");
  const [confirmPassMsgOut, setConfirmPassMsgOut] = useState("");

  const [loading, setLoading] = useState(false);
  const { logout } = useContext(AuthContext);

  const toggleOldPassword = () => {
    setOldPwdShown(!oldPwdShown);
  };
  const toggleNewPassword = () => {
    setNewPwdShown(!newPwdShown);
  };
  const toggleConfirmPassword = () => {
    setConfirmPwdShown(!confirmPwdShown);
  };

  const handleChangePass = async () => {
    if (currPassword === "") {
      setCurrPassMsgOut("(PLEASE INPUT YOUR CURRENT PASSWORD)");
      return;
    } else {
      setCurrPassMsgOut("");
    }

    if (password === "") {
      setPassMsgOut("(PLEASE INPUT YOUR PASSWORD)");
      return;
    } else {
      setPassMsgOut("");
    }

    if (confirmPassword === "") {
      setConfirmPassMsgOut("(PLEASE CONFIRM YOUR PASSWORD)");
      return;
    } else {
      setConfirmPassMsgOut("");
    }

    if (password !== confirmPassword) {
      toast.error("Password and confirm password are not match");
      return;
    } else {
      setConfirmPassMsgOut("");
    }

    try {
      setLoading(true);
      const res = await axiosApiInstance.put(`/user/changePass`, {
        curr_pass: currPassword,
        password: password,
      });

      if (res && res.data.success) {
        toast.success(res.data.msg);
        await logout();
      } else {
        toast.success(res.data.msg);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 404) {
        toast.error(error.response.data.detail);
      } else if (error.response && error.response.status === 409) {
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
    <SideBar>
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-bold">Change Password</h2>
        <div className="text-sm w-full relative">
          <label className="text-border font-semibold">
            Current Password{" "}
            <span className="text-subMain">{currPassMsgOut}</span>
          </label>
          <input
            required
            value={currPassword}
            onChange={(e) => setCurrPassword(e.target.value)}
            type={oldPwdShown ? "text" : "password"}
            placeholder="********"
            className="w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry"
          />
          <button
            type="button"
            className="absolute right-4 top-10"
            onClick={toggleOldPassword}
          >
            {oldPwdShown ? (
              <FaEyeSlash className="w-6 h-6" />
            ) : (
              <FaEye className="w-6 h-6" />
            )}
          </button>
        </div>

        <div className="text-sm w-full relative">
          <label className="text-border font-semibold">
            New Password <span className="text-subMain">{passMsgOut}</span>
          </label>
          <input
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={newPwdShown ? "text" : "password"}
            placeholder="********"
            className="w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry"
          />
          <button
            type="button"
            className="absolute right-4 top-10"
            onClick={toggleNewPassword}
          >
            {newPwdShown ? (
              <FaEyeSlash className="w-6 h-6" />
            ) : (
              <FaEye className="w-6 h-6" />
            )}
          </button>
        </div>

        <div className="text-sm w-full relative">
          <label className="text-border font-semibold">
            Confirm New Password{" "}
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
        <div className="flex gap-2 flex-wrap flex-col-reverse sm:flex-row justify-between items-center my-4">
          <button
            className="bg-subMain transitions hover:bg-main border border-subMain text-white py-3 px-6 rounded w-full sm:w-auto"
            onClick={handleChangePass}
            disabled={loading}
          >
            Change Password
          </button>
        </div>
      </div>
    </SideBar>
  );
}

export default ChangePass;
