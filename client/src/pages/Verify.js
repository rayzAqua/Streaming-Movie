import React, {useRef} from 'react'
import { FiLogIn } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Layout from '../layout/Layout';
import { useState } from 'react';
import axiosApiInstance from '../context/intercepter';

function Verify() {
  const [code,setCode] = useState('');
  const [registerMsgOut, setRegisterMsgOut] = useState("");

  const handleClick = async (e) => {
    e.preventDefault()
    try{
      const query = await axiosApiInstance.put(axiosApiInstance.defaults.baseURL + `/verify?verify_code=${code}`)
      window.location.href = "/";
    }catch(e){
      setRegisterMsgOut("ERROR CODE")
    }
  }
  return (
    <Layout>
    <form className='container mx-auto px-2 mt-16 mb-20 flex-colo'>
      <div className='w-full 2xl:w-2/5 gap-6 flex-colo p-14 md:w-3/5 bg-dry rounded-lg border border-border'>
        <img
          src='/image/logo.png'
          alt='logo'
          className='w-full h-12 object-contain'/>
        <div className="text-sm w-full">
          <label className="text-border font-semibold">Verify Code</label>
          <input
              required
              value={code}
              onChange={(e)=>setCode(e.target.value)}
              type="text"
              placeholder="XXXXXXXX"
              className='w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry'
              />
        </div>
        <span className='text-subMain'>{registerMsgOut}</span>
        <button 
          onClick={handleClick}
          className="bg-subMain transitions hover:bg-main flex-rows gap-4 text-white py-4 rounded-lg w-full">
            Verify
        </button>

      </div>
    </form>

  </Layout>
  )
}

export default Verify