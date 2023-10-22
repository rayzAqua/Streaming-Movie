import React from 'react'
import { Link } from 'react-router-dom'
import { FaHeart } from 'react-icons/fa'
import { toast } from 'react-toastify';
import axiosApiInstance from '../../context/intercepter';

function MovieCard({movie, favoriteFilm,setFavoriteFilm, user}) {
  const handleFavorite = async (id) => {
    if (favoriteFilm.includes(id)) {
      try {
        await axiosApiInstance.delete(`/films/deleteFavoriteFilm/${id}`);
        setFavoriteFilm(favoriteFilm.filter(ident => ident !== id));
        toast.success('Remove from favorite');
      } catch (error) {
        toast.error('Error removing film from favorite');
        console.log(error);
      }
    } else {
      try {
        await axiosApiInstance.post(`/films/addFavoriteFilm/${id}`);
        setFavoriteFilm([...favoriteFilm, id]);
        toast.success('Add to favorite');
      } catch (error) {
        toast.error('Error adding film to favorite');
        console.log(error);
      }
    }
  };

  function isFilmFavorite(filmId) {
    return favoriteFilm.includes(filmId);
  }

  return (
    <>
    <div className='border border-border p-1 hover:scale-95 transitions relative rounded overflow-hidden'>
        <Link to={`/movie/${movie?.title}`} className='w-full'>
            <img 
                src={`${movie?.poster}`} 
                alt={movie?.title} 
                className='w-full h-96 object-cover'/>
        </Link>
        <div className='absolute flex-btn gap-2 bottom-0 right-0 left-0 bg-main bg-opacity-60 text-white px-4 py-3'>
            <h3 className='font-semibold truncate'>{movie?.title}</h3>
            {
              user?
              <button onClick={(e)=>handleFavorite(movie.id)} className={`h-9 w-9 text-sm flex-colo transitions border-2 border-subMain rounded-md ${isFilmFavorite(movie.id)?"bg-subMain hover:bg-transparent":"bg-transparent hover:bg-subMain"} text-white`}>
                  <FaHeart/>
              </button>:
              <Link to={`/login`} className='h-9 w-9 text-sm flex-colo transitions border-2 border-subMain rounded-md bg-transparent hover:bg-subMain text-white '>
                  <FaHeart/>
              </Link>
            }
        </div>
    </div>
    </>
  )
}

export default MovieCard