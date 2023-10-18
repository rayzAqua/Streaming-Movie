import React from "react";
import Layout from "../../layout/Layout";
import { useLocation, useParams } from "react-router-dom";
import MovieInfo from "../../components/customer/MovieInfo";
import Titles from "../../components/customer/Title";
import { useState } from "react";
import axios from "../../api/axios";
import axiosApiInstance from "../../context/intercepter";
import AuthContext from "../../context/AuthProvider";
import { useContext } from "react";
import { useEffect } from "react";
import { Autoplay } from "swiper";
import { SwiperSlide, Swiper } from "swiper/react";
import { FaUserFriends } from "react-icons/fa";
import { CgSpinner } from "react-icons/cg";
import MovieRating from "../../components/customer/MovieRating";
import PopularMovies from "../../components/customer/PopularMovies";
import { GiCancel } from "react-icons/gi";
import { toast } from "react-toastify";

function SingleMovie() {
  const { id } = useParams();
  const param = useLocation();
  const { user } = useContext(AuthContext);
  const [load, setLoad] = useState(false);
  const [loadFavorite, setLoadFavorite] = useState(false);
  const [loadActor, setLoadActor] = useState(false);
  const [loadRate, setLoadRate] = useState(false);
  const [movie, setMovie] = useState();
  const [checkFavorite, setCheckFavorite] = useState(false);
  const [actors, setActors] = useState([]);
  const [rate, setRate] = useState();
  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
  };

  const handleLogin = async (e) => {
    window.location.href = "/login";
  };

  const handleBtn = async (e) => {
    const days = e.currentTarget.getAttribute("data-days");
    try {
      const response = await axiosApiInstance.post(
        `/payment/forFilm/${movie.id}?days=${days}`
      );

      if (response?.status === 200 || response?.status === 201) {
        toast.success(response?.data.msg);
        window.location.href = "/";
      } else {
        toast.error(response?.data?.message + "Please try again");
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.error(error.response.data.detail);
      } else {
        console.error("Lỗi khi gọi API:", error);
      }
      toast.error("Please try again");
    }
  };

  async function checkFilmFavorite() {
    try {
      const response = await axiosApiInstance.get(
        axiosApiInstance.defaults.baseURL + `/films/getFavoriteFilms`
      );
      {
        const favoriteIds = response.data.map((film) => film.id);
        if (favoriteIds.includes(movie.id)) setCheckFavorite(true);
      }
    } catch (error) {}
    setLoadFavorite(true);
  }

  async function getMovie() {
    const result = await axios.get(
      axios.defaults.baseURL + `/films/getFilm/${id}`
    );
    setMovie(result?.data);
    setLoad(true);
  }

  async function getActors() {
    const result = await axios.get(
      axios.defaults.baseURL + `/actors/getFromFilm/${movie.id}`
    );
    setActors(result?.data);
    setLoadActor(true);
  }

  async function getRate() {
    const result = await axios.get(
      axios.defaults.baseURL + `/films/averageRating/${movie.id}`
    );
    setRate(result?.data.average_rating);
    setLoadRate(true);
  }

  useEffect(() => {
    getMovie();
    if (movie != null) {
      getActors();
      getRate();
    }
  }, [movie, param, load]);
  useEffect(() => {
    if (user != null) {
      checkFilmFavorite();
    }
  }, [param, loadFavorite]);

  return (
    <Layout>
      {movie ? (
        <div className="relative">
          {show ? (
            <div class="absolute z-50 top-0 left-0 bottom-0 right-0 px-6 py-8 bg-dry bg-opacity-40">
              <button
                className="bg-transparent border-0 text-black float-right"
                onClick={handleClose}
              >
                <GiCancel className="text-white h-6 w-6 text-xl blockpy-0" />
              </button>
              <h1 class="text-2xl font-semibold text-center text-subMain capitalize lg:text-3xl">
                Pricing Plan
              </h1>

              <p class="max-w-2xl mx-auto mt-4 text-center text-dryGray xl:mt-6 dark:text-gray-300">
                Register package for watching unlimited our Movies on NetMovie
              </p>

              <div class="grid grid-cols-1 gap-8 mt-6 xl:mt-12 xl:gap-12 md:grid-cols-2 lg:grid-cols-3">
                <div class="w-full p-8 space-y-8 text-center bg-blue-600 rounded-lg">
                  <p class="font-medium text-gray-200 uppercase">
                    1 DAY WATCHING {" " + movie.title}
                  </p>

                  <h2 class="text-5xl font-bold text-white uppercase dark:text-gray-100">
                    {movie.price} VND
                  </h2>

                  <p class="font-medium text-xl text-gray-200">For 1 day</p>
                  {user ? (
                    <button
                      type="button"
                      onClick={handleBtn}
                      data-days={1}
                      class="block w-full px-4 py-2 mt-10 tracking-wide text-blue-500 capitalize transition-colors duration-300 transform bg-white rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:ring focus:ring-gray-200 focus:ring-opacity-80"
                    >
                      Register Now
                    </button>
                  ) : (
                    <button
                      onClick={handleLogin}
                      class="w-full px-4 py-2 mt-10 tracking-wide text-blue-500 capitalize transition-colors duration-300 transform bg-white rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:ring focus:ring-gray-200 focus:ring-opacity-80"
                    >
                      Register Now
                    </button>
                  )}
                </div>

                <div class="w-full p-8 space-y-8 text-center bg-blue-600 rounded-lg">
                  <p class="font-medium text-gray-200 uppercase">
                    2 DAYS WATCHING {" " + movie.title}
                  </p>

                  <h2 class="text-5xl font-bold text-white uppercase dark:text-gray-100">
                    {movie.price * 2} VND
                  </h2>

                  <p class="font-medium text-xl text-gray-200">For 2 days</p>
                  {user ? (
                    <button
                      type="button"
                      onClick={handleBtn}
                      data-days={2}
                      class="block w-full px-4 py-2 mt-10 tracking-wide text-blue-500 capitalize transition-colors duration-300 transform bg-white rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:ring focus:ring-gray-200 focus:ring-opacity-80"
                    >
                      Register Now
                    </button>
                  ) : (
                    <button
                      onClick={handleLogin}
                      class="w-full px-4 py-2 mt-10 tracking-wide text-blue-500 capitalize transition-colors duration-300 transform bg-white rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:ring focus:ring-gray-200 focus:ring-opacity-80"
                    >
                      Register Now
                    </button>
                  )}
                </div>

                <div class="w-full p-8 space-y-8 text-center bg-blue-600 rounded-lg">
                  <p class="font-medium text-gray-200 uppercase">
                    3 DAYS WATCHING {" " + movie.title}
                  </p>

                  <h2 class="text-5xl font-bold text-white uppercase dark:text-gray-100">
                    {movie.price * 3} VND
                  </h2>

                  <p class="font-medium text-xl text-gray-200">For 3 days</p>
                  {user ? (
                    <button
                      type="button"
                      onClick={handleBtn}
                      data-days={3}
                      class="block w-full px-4 py-2 mt-10 tracking-wide text-blue-500 capitalize transition-colors duration-300 transform bg-white rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:ring focus:ring-gray-200 focus:ring-opacity-80"
                    >
                      Register Now
                    </button>
                  ) : (
                    <button
                      onClick={handleLogin}
                      class="w-full px-4 py-2 mt-10 tracking-wide text-blue-500 capitalize transition-colors duration-300 transform bg-white rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:ring focus:ring-gray-200 focus:ring-opacity-80"
                    >
                      Register Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <MovieInfo
            movie={movie}
            user={user}
            checkFavorite={checkFavorite}
            setCheckFavorite={setCheckFavorite}
            rate={rate}
            setLoadFavorite={setLoadFavorite}
            setShow={setShow}
          />
          <div className="container mx-auto min-h-screen px-2 my-6">
            <div className="my-12">
              <Titles title="Casts" Icon={FaUserFriends} />
              <div className="mt-10">
                <Swiper
                  autoplay={{
                    delay: 1000,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                  speed={1000}
                  module={[Autoplay]}
                  spaceBetween={10}
                  breakpoints={{
                    0: {
                      slidesPerView: 1,
                    },
                    400: {
                      slidesPerView: 2,
                    },
                    768: {
                      slidesPerView: 3,
                    },
                    1024: {
                      slidesPerView: 4,
                    },
                    1280: {
                      slidesPerView: 5,
                      spaceBetween: 30,
                    },
                  }}
                >
                  {actors.map((actor, i) => (
                    <SwiperSlide key={i}>
                      <div className="w-full p-3 italic text-text rounded flex-colo bg-dry border border-gray-800">
                        <img
                          src={`${actor.photo}`}
                          alt={actor.name}
                          className="w-full h-64 object-cover rounded mb-2"
                        />
                        <p>{actor?.name}</p>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
            <MovieRating movie={movie} setLoadRate={setLoadRate} user={user} />
            <PopularMovies />
          </div>
        </div>
      ) : (
        <div>
          Loading More <CgSpinner className="animate-spin" />
        </div>
      )}
    </Layout>
  );
}

export default SingleMovie;
