import React from 'react'
import SideBar from '../../components/nav/SideBar'
import { Link, useLocation } from 'react-router-dom';
import axiosApiInstance from '../../context/intercepter';
import { toast } from 'react-toastify';
import { AiFillEye } from 'react-icons/ai';
import { VscError } from 'react-icons/vsc';
import { useState } from 'react';
import { useEffect } from 'react';

function Favorite() {
  const Head = "text-xs text-center text-main font-semibold px-6 py-2 uppercase";
  const Text = "text-sm text-center leading-6 whitespace-nowrap px-5 py-3";
  const [load,setLoad] = useState(false);
  const param = useLocation();
  const [listFavoriteFim, setListFavoriteFilm] = useState([]);
  
  async function getFavorite(){
    try {
      const response = await axiosApiInstance.get(axiosApiInstance.defaults.baseURL + `/films/getFavoriteFilms`);
      setListFavoriteFilm(response.data);
    } catch (error) {
      setListFavoriteFilm([]);
      console.error('Error fetching favorite films:', error);
    }
    setLoad(true);
  }

  const handleRemoveAll = async () => {
    try {
      await axiosApiInstance.delete(`/films/deleteAllFavorite`);
      setListFavoriteFilm([]);
      toast.success('Remove from favorite');
    } catch (error) {
      toast.error('Error removing film from favorite');
      console.log(error);
    }
    setLoad(false);
  };

  const handleRemove = async (id) => {
    try {
    await axiosApiInstance.delete(`/films/deleteFavoriteFilm/${id}`);
    setListFavoriteFilm(listFavoriteFim.filter(ident => ident !== id));
    toast.success('Remove from favorite');
    } catch (error) {
    toast.error('Error removing film from favorite');
    console.log(error);
    }
    setLoad(false);
  };

  useEffect(() => {
    getFavorite();
  }, [param,load]);

  return (
    <SideBar>
      <div className='flex flex-col gap-6'>
        <div className='flex-btn gap-2'>
          <h2 className='text-xl font-bold'>Favorite Movies</h2>
          <button onClick={(e)=>handleRemoveAll()} className='bg-main font-medium transitions hover:bg-subMain border border-subMain text-white py-3 px-6 rounded'>
            Remove All
          </button>
        </div>
        <div className='overflow-x-scroll overflow-hidden relative w-full'>
          <table className='w-full table-auto border border-border divide-y divide-border'>
              <thead>
                  <tr className='bg-dryGray'>
                      <th scope='col' className={`${Head}`}>
                          Image
                      </th>
                      <th scope='col' className={`${Head}`}>
                          Name
                      </th>
                      <th scope='col' className={`${Head}`}>
                          Genre
                      </th>
                      <th scope='col' className={`${Head}`}>
                          Year
                      </th>
                      <th scope='col' className={`${Head}`}>
                          Minutes
                      </th>
                      <th scope='col' className={`${Head}`}>
                          Action
                      </th>
                  </tr>
              </thead>
              <tbody className='bg-main divide-y divide-gray-800'>
              {listFavoriteFim.map((movie) => (
                <tr key={movie.id}>
                  <td className={`${Text}`}>
                    <div className='w-12 p-1 bg-dry border border-border h-12 rounded overflow-hidden'>
                      <img
                        className='h-16 w-16 object-cover'
                        src={`${movie.poster}`}
                        alt={movie?.name}/>    
                    </div>
                  </td>
                  <td className={`${Text} truncate max-w-xs`}>{movie.title}</td>
                  <td className={`${Text}`}>{movie.genre.name}</td>
                  <td className={`${Text}`}>{movie.production_year}</td>
                  <td className={`${Text}`}>{movie.length}</td>
                  <td className={`${Text} flex-rows gap-2 mt-2`}>
                    <Link to={`/movie/${movie?.title}`} className='border border-white bg-subInfo flex-rows gap-2 text-white rounded py-1 px-2'>
                      Watch <AiFillEye/>
                    </Link>
                    <button onClick={(e) => handleRemove(movie.id)} className='border border-white bg-subMain flex-rows gap-2 text-white rounded py-1 px-2'>
                      Remove <VscError/>
                    </button>
                  </td>
                </tr>
              ))}
              </tbody>
          </table>
        </div>
      </div>
    </SideBar>
  )
}

export default Favorite