import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '../layout/Layout'
import { useRef } from 'react';

function UserFogotPass() {
    const email = useRef("");
  return (
    <Layout>
      <form className='container mx-auto px-2 mt-16 mb-20 flex-colo'>
        <div className='w-full 2xl:w-2/5 gap-6 flex-colo p-14 md:w-3/5 bg-dry rounded-lg border border-border'>
          <img
            src='/image/logo.png'
            alt='logo'
            className='w-full h-12 object-contain'/>
          <div className="text-sm w-full">
            <label className="text-border font-semibold">Email</label>
            <input
                required
                ref={email}
                type="email"
                placeholder="NetMovie@gmail.com"
                className='w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry'
                />
          </div>

          <Link 
            to="/dashboard"
            className="bg-subMain transitions hover:bg-main flex-rows gap-4 text-white py-4 rounded-lg w-full">
              Send
            </Link>
        </div>
      </form>

    </Layout>
  )
}

export default UserFogotPass