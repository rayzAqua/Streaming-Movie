import React from 'react'
import { useState } from 'react';
import { useRef } from 'react';
import Layout from '../layout/Layout';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function UserChangePass() {
    const newPass = useRef("");
    const configNewPass = useRef("");

    const [newPwdShown, setNewPwdShown] = useState(false);
    const [configPwdShown, setConfigPwdShown] = useState(false);

    const toggleNewPassword = () => {
        setNewPwdShown(!newPwdShown);
    };
    const toggleConfigPassword = () => {
        setConfigPwdShown(!configPwdShown);
    };
  return (
    <Layout>
    <form className='container mx-auto px-2 mt-16 mb-20 flex-colo'>
      <div className='w-full 2xl:w-2/5 gap-6 flex-colo p-8 sm:p-14 md:w-3/5 bg-dry rounded-lg border border-border'>
        <img
          src='/image/logo.png'
          alt='logo'
          className='w-full h-12 object-contain'/>

        <div className="text-sm w-full relative">
          <label className="text-border font-semibold">New password</label>
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
          <label className="text-border font-semibold"> Config Password</label>
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
        <Link 
          to="/dashboard"
          className="bg-subMain transitions hover:bg-main flex-rows gap-4 text-white py-4 rounded-lg w-full">
             Change Password
        </Link>

      </div>
    </form>

  </Layout>
  )
}

export default UserChangePass