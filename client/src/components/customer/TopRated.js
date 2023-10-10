import React, { useState } from 'react'
import Title from './Title'
import {BsBookmarkStarFill, BsCaretLeftFill, BsCaretRightFill} from 'react-icons/bs'
import {FaHeart} from 'react-icons/fa'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper'
import { Movies } from '../../Data/MovieData';
import { Link, useLocation } from 'react-router-dom'
import Rating from './Star'
import { useEffect } from 'react'
import { useContext } from 'react'
import AuthContext from '../../context/AuthProvider'
import axios from '../../api/axios'
import axiosApiInstance from '../../context/intercepter'
import { toast } from 'react-toastify'

function TopRated() {
  const {user}= useContext(AuthContext);
  const param = useLocation();

  const [nextEl, setNextEl] = useState(null);
  const [prevEl, setPrevEl] = useState(null);
  const classNames = "hover:bg-dry transitions text-sm rounded w-8 h-8 flex-colo bg-subMain text-white";
  const [load, setLoad] = useState(false);
  const [loadFavorite, setLoadFavorite] = useState(false);

  const [favoriteFilm, setFavoriteFilm] = useState([]);
  const [topRate, settopRate] = useState([]);

  async function getFavoriteId(){
    try {
      const response = await axiosApiInstance.get(axiosApiInstance.defaults.baseURL + `/films/getFavoriteFilms`);
      const favoriteIds = response.data.map(film => film.id);
      setFavoriteFilm(favoriteIds);
    } catch (error) {
      console.error('Error fetching favorite films:', error);
    }
    setLoadFavorite(true);
  }

  async function getTopRateFilm() {
    const result = await axios.get(axios.defaults.baseURL + `/films/topRatedFilms`);
    settopRate(result?.data);
    setLoad(true);
  }

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

  useEffect(() => {
    getTopRateFilm();
  }, [param,load]);
  useEffect(() => {
    if (user != null) {
      getFavoriteId();
    }
  }, [param,loadFavorite]);
  
  return (
    <div className='my-16'>
      <Title title='Top Rated' Icon={BsBookmarkStarFill}/>
      <div className='mt-10'>
        <Swiper 
          navigation={{nextEl,prevEl}} 
          slidesPerView={4} 
          spaceBetween={40} 
          autoplay={true} 
          speed={1000}
          loop={true}
          modules={[Navigation,Autoplay]}>
            {
              topRate.map((movie,index)=>(
                <SwiperSlide key={index}>
                  <div className='p-4 h-rate hovered border border-border bg-dry rounded-lg overflow-hidden'>
                    <img 
                      src={`${movie.poster}`}
                      alt={movie.title}
                      className='w-full h-full object-cover rounded-lg'/>
                    <div className='hoveres px-4 gap-6 text-center absolute bg-black bg-opacity-70 top-0 left-0 right-0 bottom-0'>
                      <button onClick={(e)=>handleFavorite(movie.id)} className={`w-12 h-12 flex-colo transitions ${isFilmFavorite(movie.id)?"text-subMain bg-opacity-70 hover:text-white hover:bg-opacity-30":"text-white bg-opacity-30 hover:bg-opacity-70 hover:text-subMain"} rounded-full bg-white`}>
                        <FaHeart/>
                      </button>
                      <Link className='font-semibold text-xl trancuted line-clamp-2' 
                        to={`/movies/${movie.title}`}>{movie.title}</Link>
                        <div className='flex gap-2 text-star'>
                          <Rating value={movie.avg_rating}/>
                        </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))
            }
        </Swiper>
        <div className='w-full px-1 flex-rows gap-6 pt-12'>
            <button className={classNames} ref={(node)=>setPrevEl(node)}>
              <BsCaretLeftFill/>
            </button>
            <button className={classNames} ref={(node)=>setNextEl(node)}>
              <BsCaretRightFill/>
            </button>
        </div>
      </div>
    </div>
  )
}

export default TopRated