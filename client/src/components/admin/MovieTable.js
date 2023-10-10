import React from 'react'
import { FaEdit } from 'react-icons/fa';
import { TbLock, TbLockOpen } from 'react-icons/tb';

const Head = "text-xs text-center text-main font-semibold px-6 py-2 uppercase";
const Text = "text-sm text-center leading-6 whitespace-nowrap px-5 py-3";

const Rows = (movie,i,onBtnEditClick,onBtnBlockClick,blockStatus)=>{
    return(
        <tr key={i}>
            <td className={`${Text} truncate`}>{movie.id}</td>
            <td className={`${Text}`}>{movie.name}</td>
            <td className={`${Text}`}>
                <div className='w-12 bg-dry border border-border h-12 rounded overflow-hidden'>
                    <img
                    className='h-12 w-12 object-cover'
                    src={`/image/movies/${movie.titleImage}`}
                    alt={movie?.name}/>    
                </div>
            </td>
            <td className={`${Text}`}>{movie.category}</td>
            <td className={`${Text}`}>{movie.year}</td>
            <td className={`${Text}`}>{movie.time}</td>

            <td className={`${Text} flex-rows gap-2 mt-2`}>
                <button type='button' onClick={onBtnEditClick} className='border border-white bg-yellow-200 flex-rows gap-2 text-main rounded py-1 px-2'>
                    <FaEdit/> Edit
                </button>
                <button type = 'button' onClick={onBtnBlockClick} className='border border-white bg-subMain flex-rows gap-2 text-white rounded py-1 px-2'>
                    {blockStatus?<TbLock className='w-6 h-6'/>:<TbLockOpen className='w-6 h-6'/>}
                </button>
            </td>
        </tr>
    )
}


function MovieTable({movies, onBtnEditClick,onBtnBlockClick,blockStatus}) {
    return (
        <div className='overflow-x-scroll overflow-hidden relative w-full rounded-lg'>
            <table className='w-full table-auto border border-border divide-y divide-border'>
                <thead>
                    <tr className='bg-dryGray'>
                        <th scope='col' className={`${Head}`}>
                            Movie ID
                        </th>
                        <th scope='col' className={`${Head}`}>
                            Movie Name
                        </th>
                        <th scope='col' className={`${Head}`}>
                            Poster
                        </th>
                        <th scope='col' className={`${Head}`}>
                            Genre
                        </th>
                        <th scope='col' className={`${Head}`}>
                            Year
                        </th>
                        <th scope='col' className={`${Head}`}>
                            Monites
                        </th>
                        <th scope='col' className={`${Head}`}>
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody className='bg-main divide-y divide-gray-800'>
                    {movies.map((movie,index)=> Rows(movie,index,onBtnEditClick,onBtnBlockClick,blockStatus))}
                </tbody>
            </table>
        </div>
      )
}

export default MovieTable