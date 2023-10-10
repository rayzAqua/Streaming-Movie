import React,{useState,useRef} from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import SideBar from '../../components/nav/SideBar';

function ChangePass() {
    const oldPass = useRef("");
    const newPass = useRef("");
    const configNewPass = useRef("");

    const [oldPwdShown, setOldPwdShown] = useState(false);
    const [newPwdShown, setNewPwdShown] = useState(false);
    const [configPwdShown, setConfigPwdShown] = useState(false);

    const toggleOldPassword = () => {
        setOldPwdShown(!oldPwdShown);
    };
    const toggleNewPassword = () => {
        setNewPwdShown(!newPwdShown);
    };
    const toggleConfigPassword = () => {
        setConfigPwdShown(!configPwdShown);
    };
  return (
    <SideBar>
        <div className='flex flex-col gap-6'>
            <h2 className='text-xl font-bold'>Change Password</h2>
            <div className="text-sm w-full relative">
                <label className="text-border font-semibold">Current Password</label>
                <input
                    required
                    ref={oldPass}
                    type={oldPwdShown ? "text" : "password"}
                    placeholder="********"
                    className='w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry'
                    />
                <button type='button' className='absolute right-4 top-10' onClick={toggleOldPassword}>
                {
                    oldPwdShown?
                    <FaEyeSlash className='w-6 h-6'/>
                    :
                    <FaEye className='w-6 h-6'/>
                }
                </button>
            </div>

            <div className="text-sm w-full relative">
                <label className="text-border font-semibold"> New Password</label>
                <input
                    required
                    ref={newPass}
                    type={newPwdShown ? "text" : "password"}
                    placeholder="********"
                    className='w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry'
                    />
                <button type='button' className='absolute right-4 top-10' onClick={toggleNewPassword}>
                {
                    newPwdShown?
                    <FaEyeSlash className='w-6 h-6'/>
                    :
                    <FaEye className='w-6 h-6'/>
                }
                </button>
            </div>

            <div className="text-sm w-full relative">
                <label className="text-border font-semibold"> Config New Password</label>
                <input
                    required
                    ref={configNewPass}
                    type={configPwdShown ? "text" : "password"}
                    placeholder="********"
                    className='w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry'
                    />
                <button type='button' className='absolute right-4 top-10' onClick={toggleConfigPassword}>
                {
                    configPwdShown?
                    <FaEyeSlash className='w-6 h-6'/>
                    :
                    <FaEye className='w-6 h-6'/>
                }
                </button>
            </div>
            <div className='flex gap-2 flex-wrap flex-col-reverse sm:flex-row justify-between items-center my-4'>
                <button className='bg-subMain transitions hover:bg-main border border-subMain text-white py-3 px-6 rounded w-full sm:w-auto'>
                Change Password
                </button>
            </div>
        </div>
    </SideBar>
  )
}

export default ChangePass