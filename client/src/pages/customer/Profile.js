import React, { useEffect, useState } from "react";
import SideBar from "../../components/nav/SideBar";
import axiosApiInstance from "../../context/intercepter";
import { toast } from "react-toastify";

function Profile() {
  // const name = useRef("");
  // const email = useRef("");
  const [userData, setUserData] = useState();
  const [isUpdate, setIsUpdate] = useState(false);

  const [newName, setNewName] = useState("");
  const [nameMsgOut, setNameMsgOut] = useState("");
  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axiosApiInstance.get("user/profile");
        if (res) {
          console.log(res);
          setUserData(res.data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
    fetchData();
  }, []);

  const handleOpenUpdate = () => {
    setIsUpdate(true);
  };

  const handleCancel = () => {
    setIsUpdate(false);
    setNameMsgOut("");
    setNewName("");
  };

  const handleUpdate = async () => {
    if (newName === "") {
      setNameMsgOut("(PLEASE INPUT YOUR NAME)");
      return;
    } else {
      setNameMsgOut("");
    }
    try {
      setIsLoading(true);
      const res = await axiosApiInstance.put(`/user/editProfile`, {
        name: newName,
      });
      if (res && res.data.success) {
        toast.success(res.data.msg);
        setIsUpdate(false);
        setIsLoading(false);
        setUserData(res.data.update);
        setNameMsgOut("");
        setNewName("");
      } else {
        toast.success(res.data.msg);
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.detail);
      } else if (error.response && error.response.status === 404) {
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
        {!isUpdate ? (
          <>
            <h2 className="text-xl font-bold">Profile</h2>
            {/* <Uploader/> */}
            <div className="text-sm w-full">
              <label className="text-border font-semibold">Full Name</label>
              <input
                required
                value={userData?.name}
                type="text"
                placeholder="Your full name"
                className="w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry"
              />
            </div>

            <div className="text-sm w-full">
              <label className="text-border font-semibold">Email</label>
              <input
                required
                value={userData?.email}
                type="email"
                placeholder="NetMovie@gmail.com"
                className="w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry"
              />
            </div>
            <div className="flex gap-2 flex-wrap flex-col-reverse sm:flex-row justify-between items-center my-4">
              <button
                onClick={handleOpenUpdate}
                className="bg-subMain transitions hover:bg-main border border-subMain text-white py-3 px-6 rounded w-full sm:w-auto"
              >
                Update Profile
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold">Profile</h2>
            {/* <Uploader/> */}
            <div className="text-sm w-full">
              <label className="text-border font-semibold">
                Full Name <span className="text-subMain">{nameMsgOut}</span>
              </label>
              <input
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                type="text"
                placeholder="Your full name"
                className="w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry"
              />
            </div>
            <div className="flex gap-2 flex-wrap justify-start items-center my-4">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="bg-subMain transitions hover:bg-main border border-subMain text-white py-3 px-6 rounded w-full sm:w-auto"
              >
                Confirm
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="bg-darkBlue transitions hover:bg-main border border-darkBlue text-white py-3 px-6 rounded w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </SideBar>
  );
}

export default Profile;
