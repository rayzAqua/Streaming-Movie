import React from 'react'
import { Link } from 'react-router-dom'
import {BiHomeAlt} from 'react-icons/bi'

function NotFound() {
  return (
    <div className='flex-colo gap-8 w-full min-h-screen text-white bg-main lg:py-20 py-10 px-6'>
      <img className='w-full h-96 object-contain' src='' alt='notfound'/>
      <h1 className='lg:text-4xl font-bold'>Page Not Found!</h1>
      <p className='font-medium text-border italic leading-6'>The page you are looking for does not exist. You may have mistyped the URL</p>
      <Link to='/'
        className='bg-subMain text-white flex-rows gap-4 font-medium py-3 px-4 rounded-md'>
          <BiHomeAlt/> Home
      </Link>
    </div>
  )
}

export default NotFound