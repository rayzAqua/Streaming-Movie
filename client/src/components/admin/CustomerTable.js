import React from 'react'

const Head = "text-xs text-center text-main font-semibold px-6 py-2 uppercase";
const Text = "text-sm text-center leading-6 whitespace-nowrap px-5 py-3";

const Rows = (user,i)=>{
    return(
        <tr key={i}>
            <td className={`${Text} truncate`}>{user.id}</td>
            <td className={`${Text}`}>{user.name}</td>
            <td className={`${Text}`}>{user.email}</td>
            <td className={`${Text}`}>{user.status==0? "Inactive": (user.status==1?"Active":(user.status==2?"Verify":"ChangePass"))}</td>
            <td className={`${Text} flex-rows gap-2 mt-2`}>
                <button type='button' className='border border-white bg-yellow-200 flex-rows gap-2 text-main rounded py-1 px-2'>
                    Block
                </button>
            </td>
        </tr>
    )
}

function CustomerTable({user}) {
    return (
        <div className='overflow-x-scroll overflow-hidden relative w-full rounded-lg'>
            <table className='w-full table-auto border border-border divide-y divide-border'>
                <thead>
                    <tr className='bg-dryGray'>
                        <th scope='col' className={`${Head}`}>
                            Customer ID
                        </th>
                        <th scope='col' className={`${Head}`}>
                            Name
                        </th>
                        <th scope='col' className={`${Head}`}>
                            Email
                        </th>
                        <th scope='col' className={`${Head}`}>
                            Status
                        </th>
                        <th scope='col' className={`${Head}`}>
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody className='bg-main divide-y divide-gray-800'>
                    {user.map((user,index)=> Rows(user,index))}
                </tbody>
            </table>
        </div>
    )
}

export default CustomerTable