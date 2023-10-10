import React from 'react'
import SideBarAdmin from '../components/nav/SideBarAdmin'
import NavBarAdmin from '../components/nav/NavBarAdmin'
import { ToastContainer } from 'react-toastify'

function AdminLayout({children}) {
  return (
    <>
    <ToastContainer />
    <div className='bg-main text-white flex flex-row'>
        <SideBarAdmin/>
        <div
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="10"
          data-aos-offset="200"  
          className='w-full flex flex-col'>
        {children}
        </div>
    </div> 
    </>
  )
}

export default AdminLayout