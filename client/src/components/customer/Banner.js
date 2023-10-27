import React from "react";
import { Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import FlexMovieItems from "./FlexMovieItems";
import { Link, useLocation } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import AuthContext from "../../context/AuthProvider";
import axios from "./../../api/axios";
import axiosApiInstance from "../../context/intercepter";
import { toast } from "react-toastify";

function Banner() {
  const param = useLocation();
  const [load, setLoad] = useState(false);
  const [loadFavorite, setLoadFavorite] = useState(true);
  const { user } = useContext(AuthContext);
  const [filmBanner, setFilmBanner] = useState([]);
  const [favoriteFilm, setFavoriteFilm] = useState([]);
  useEffect(() => {
    getBannerFilm();
    console.log(filmBanner);
  }, [param, load]);
  useEffect(() => {
    if (user != null) {
      getFavoriteId();
    }
  }, [param, loadFavorite]);

  const handleFavorite = async (id) => {
    if (favoriteFilm.includes(id)) {
      try {
        await axiosApiInstance.delete(`/films/deleteFavoriteFilm/${id}`);
        setFavoriteFilm(favoriteFilm.filter((ident) => ident !== id));
        toast.success("Remove from favorite");
      } catch (error) {
        toast.error("Error removing film from favorite");
        console.log(error);
      }
    } else {
      try {
        await axiosApiInstance.post(`/films/addFavoriteFilm/${id}`);
        setFavoriteFilm([...favoriteFilm, id]);
        toast.success("Add to favorite");
      } catch (error) {
        toast.error("Error adding film to favorite");
        console.log(error);
      }
    }
    setLoadFavorite(false);
  };

  async function getFavoriteId() {
    try {
      const response = await axiosApiInstance.get(
        axiosApiInstance.defaults.baseURL + `/films/getFavoriteFilms`
      );
      const favoriteIds = response.data.map((film) => film.id);
      setFavoriteFilm(favoriteIds);
    } catch (error) {
      console.error("Error fetching favorite films:", error);
    }
    setLoadFavorite(true);
  }

  function isFilmFavorite(filmId) {
    return favoriteFilm.includes(filmId);
  }

  async function getBannerFilm() {
    const result = await axios.get(
      axios.defaults.baseURL + `/films/getLatestActive`
    );
    setFilmBanner(result?.data);
    setLoad(true);
  }

  return (
    <div className="relative w-full">
      <Swiper
        direction="horizontal"
        slidesPerView={1}
        loop={true}
        speed={1000}
        modules={[Autoplay]}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        className="w-full xl:h-96 bg-dry lg:h-64 h-48"
      >
        {filmBanner.map((movie, index) => (
          <SwiperSlide
            key={movie.id}
            className="relative rounded overflow-hidden"
          >
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute linear-bg xl:pl-52 sm:pl-32 pl-8 top-0 bottom-0 right-0 left-0 flex flex-col justify-center lg:gap-8 md:gap-5 gap-4">
              <h1 className="xl:text-4xl truncate capitalize font-sans sm:text-2xl text-xl font-bold">
                {movie.title}
              </h1>
              <div className="flex gap-5 items-center text-dryGray">
                <FlexMovieItems movie={movie} />
              </div>
              <div className="flex gap-5 items-center">
                <Link
                  to={`/movie/${movie.title}`}
                  className="bg-subMain hover:text-main transitions text-white px-8 py-3 rounded font-medium sm:text-sm text-xs"
                >
                  Watch
                </Link>
                {user ? (
                  <button
                    onClick={(e) => handleFavorite(movie.id)}
                    className={`bg-white ${
                      !isFilmFavorite(movie.id)
                        ? "hover:text-subMain text-white"
                        : "text-subMain hover:text-white"
                    } transitions  px-4 py-3 rounded text-sm bg-opacity-30`}
                  >
                    <FaHeart />
                  </button>
                ) : (
                  <Link
                    to={`/login`}
                    className={`bg-white hover:text-subMain text-white transitions  px-4 py-3 rounded text-sm bg-opacity-30`}
                  >
                    <FaHeart />
                  </Link>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Banner;
