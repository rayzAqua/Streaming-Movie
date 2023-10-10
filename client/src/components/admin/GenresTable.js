import React from 'react'
import {FaEdit} from 'react-icons/fa'

const Head = "text-xs text-center text-main font-semibold px-6 py-2 uppercase";
const Text = "text-sm text-center leading-6 whitespace-nowrap px-5 py-3";

const Rows = (genre,onBtnEditClick,i)=>{
    return(
        <tr key={i}>
            <td className={`${Text} truncate`}>{genre.id}</td>
            <td className={`${Text}`}>{genre.name}</td>
            <td className={`${Text} flex-rows gap-2 mt-2`}>
                <button type='button' onClick={onBtnEditClick} className='border border-white bg-yellow-200 flex-rows gap-2 text-main rounded py-1 px-2'>
                    <FaEdit/> Edit
                </button>
                <button className='border border-white bg-subMain flex-rows gap-2 text-white rounded py-1 px-2'>
                    Films
                </button>
            </td>
        </tr>
    )
}

function GenresTable({genres, onBtnEditClick}) {
  return (
    <div className='overflow-x-scroll overflow-hidden relative w-full rounded-lg'>
        <table className='w-full table-auto border border-border divide-y divide-border'>
            <thead>
                <tr className='bg-dryGray'>
                    <th scope='col' className={`${Head}`}>
                        Genre ID
                    </th>
                    <th scope='col' className={`${Head}`}>
                        Genre Name
                    </th>
                    <th scope='col' className={`${Head}`}>
                        Action
                    </th>
                </tr>
            </thead>
            <tbody className='bg-main divide-y divide-gray-800'>
                {genres.map((genre,index)=> Rows(genre,onBtnEditClick,index))}
            </tbody>
        </table>
    </div>
  )
}

export default GenresTable