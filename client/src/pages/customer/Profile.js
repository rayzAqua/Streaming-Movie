import React, {useRef} from 'react'
import SideBar from '../../components/nav/SideBar'
import Uploader from '../../components/Uploader'

function Profile() {
  const name = useRef("");
  const email = useRef("");

  return (
    <SideBar>
      <div className='flex flex-col gap-6'>
        <h2 className='text-xl font-bold'>Profile</h2>
        {/* <Uploader/> */}
        <div className="text-sm w-full">
            <label className="text-border font-semibold">Full Name</label>
            <input
                required
                ref={name}
                type="text"
                placeholder="Your full name"
                className='w-full text-sm p-4 mt-2 border border-border rounded text-white bg-dry'
                />
          </div>

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
          <div className='flex gap-2 flex-wrap flex-col-reverse sm:flex-row justify-between items-center my-4'>
            <button className='bg-subMain transitions hover:bg-main border border-subMain text-white py-3 px-6 rounded w-full sm:w-auto'>
              Update Profile
            </button>
          </div>
      </div>
    </SideBar>
  )
}

export default Profile