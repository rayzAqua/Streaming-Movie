import React from 'react';
import NavBar from "../components/nav/NavBar"
import Footer from "../components/Footer"
import { ToastContainer } from 'react-toastify';

function Layout({children}) {
  return (
    <>
    <ToastContainer />
    <div className='bg-main text-white'>
        <NavBar/>
        {children}
        <Footer/>
    </div> 
    </>
  )
}

export default Layout