import React, { useEffect, useState } from "react";
import Layout from "../../layout/Layout";
import { Link, useLocation, useParams } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { TbFileTime } from "react-icons/tb";
import { FaHeart, FaPlay } from "react-icons/fa";
import axios from "../../api/axios";
import axiosApiInstance from "../../context/intercepter";
import { toast } from "react-toastify";

function WatchPage() {
  let { id } = useParams();
  const [play, setPlay] = useState(false);
  const param = useLocation();
  const [load, setLoad] = useState(false);
  const [loadTime, setLoadTime] = useState(false);
  const [movie, setMovie] = useState();
  const [loadFavorite, setLoadFavorite] = useState(false);
  const [checkFavorite, setCheckFavorite] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [checkTime, setCheckTime] = useState();
  const [timeStart, setTimeStart] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [firstPlay, setFirstPlay] = useState(true);

  const handleStartVideo = () => {
    setShowPopup(false);
  };

  const handleCancel = () => {
    setShowPopup(false);
    setTimeStart(0); // Đặt thời gian bắt đầu về 0 nếu người dùng không muốn chọn thời gian khác
  };

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  const handleTimeUpdate = (event) => {
    const video = event.target;
    setCurrentTime(video.currentTime);
  };

  const handleTime = async () => {
    if (currentTime < 0 || currentTime == null || !movie) {
      return;
    }
    const intValue = Math.floor(currentTime);

    if (checkTime) {
      await axiosApiInstance.put(
        `${axiosApiInstance.defaults.baseURL}/films/editTimeStamp/${movie.id}?time=${intValue}`
      );
      toast.success("Edit time stamp");
    } else {
      await axiosApiInstance.post(
        `${axiosApiInstance.defaults.baseURL}/films/addTimeStamp/${movie.id}?time=${intValue}`
      );
      toast.success("Add time stamp");
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

  useEffect(() => {
    checkFilmFavorite();
  }, [param, loadFavorite]);

  useEffect(() => {
    getMovie();
  }, [param, load]);

  useEffect(() => {
    if (movie) {
      getCheckTime();
    }
  }, [movie, loadTime]);

  const handleFavorite = async (id) => {
    if (checkFavorite) {
      try {
        await axiosApiInstance.delete(`/films/deleteFavoriteFilm/${id}`);
        setCheckFavorite(false);
        toast.success("Remove from favorite");
      } catch (error) {
        toast.error("Error removing film from favorite");
        console.log(error);
      }
    } else {
      try {
        await axiosApiInstance.post(`/films/addFavoriteFilm/${id}`);
        setCheckFavorite(true);
        toast.success("Add to favorite");
      } catch (error) {
        toast.error("Error adding film to favorite");
        console.log(error);
      }
    }
    setLoadFavorite(false);
  };

  async function getCheckTime() {
    if (movie?.id) {
      try {
        const result = await axiosApiInstance.get(
          axiosApiInstance.defaults.baseURL + `/films/checkTime/${movie.id}`
        );
        setCheckTime(result?.data.value);
        setTimeStart(result?.data.time);
        if (checkTime) setShowPopup(true);
        setLoadTime(true);
      } catch (error) {
        // Xử lý lỗi khi gọi API thất bại
        console.error("Error fetching checkTime:", error);
      }
    }
  }

  return (
    <Layout>
      <div className="container mx-auto bg-dry p-6 mb-12">
        <div className="flex-btn flex-wrap mb-6 gap-2 bg-main rounded border border-gray-800 p-6">
          <Link
            to={`/movie/${movie?.title}`}
            className="md:text-xl text-sm flex gap-3 items-center font-bold text-dryGray"
          >
            <BiArrowBack /> {movie?.title}
          </Link>
          <div className="flex-btn sm:w-auto w-full gap-5">
            <button
              onClick={(e) => handleFavorite(movie.id)}
              className={`bg-white ${
                checkFavorite
                  ? "text-subMain hover:text-white"
                  : "hover:text-subMain text-white"
              } transitions bg-opacity-50 rounded px-4 py-3 text-sm`}
            >
              <FaHeart />
            </button>
            <button
              onClick={(e) => handleTime()}
              className={`bg-white text-white hover:text-subMain transitions bg-opacity-50 rounded px-4 py-3 text-sm`}
            >
              <TbFileTime />
            </button>
          </div>
        </div>
        {/*Watch Video*/}
        {play ? (
          showPopup ? (
            <div className="w-full h-full rounded-lg overflow-hidden relative">
              <div className="absolute top-0 left-0 bottom-0 right-0 bg-main bg-opacity-30 flex-colo">
                {/* <button onClick={()=>setPlay(true)} className='bg-white text-subMain flex-colo border border-subMain rounded-full w-20 h-20 font-medium text-xl'>
                  <FaPlay/>
                </button> */}
                <div
                  id="popup-modal"
                  className="z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
                >
                  <div className="relative w-full max-w-md max-h-full">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 text-black">
                      {/* Nội dung của popup */}
                      <p className="p-5">
                        Do you want to wath from the last time?
                      </p>
                      <div className="p-6 text-center">
                        <p>{formatTime(timeStart)}</p>
                        <button
                          onClick={handleStartVideo}
                          className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
                        >
                          Yes, I'm sure
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                        >
                          No, cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <img
                src={movie?.poster}
                alt={movie?.title}
                className="w-full object-cover rounded-lg"
                style={{ maxHeight: "80vh" }}
              />
            </div>
          ) : (
            <video
              controls
              autoPlay={!showPopup}
              onPlay={(e) => {
                // Đặt thời gian xem phim là thời gian timeStart (timeStart đc lấy từ api checkTime)
                if (e.target !== null && firstPlay) {
                  try {
                    e.target.currentTime = timeStart;
                  } catch {}
                  setFirstPlay(false); // Đặt thời gian bắt đầu khi video bắt đầu phát
                }
              }}
              controlsList="nodownload"
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full rounded"
            >
              <source
                src={`${movie?.path}`}
                type="video/mp4"
                title={movie?.title}
              />
            </video>
          )
        ) : (
          <div className="w-full h-full rounded-lg overflow-hidden relative">
            <div className="absolute top-0 left-0 bottom-0 right-0 bg-main bg-opacity-30 flex-colo">
              <button
                onClick={() => setPlay(true)}
                className="bg-white text-subMain flex-colo border border-subMain rounded-full w-20 h-20 font-medium text-xl"
              >
                <FaPlay />
              </button>
            </div>
            <img
              src={movie?.poster}
              alt={movie?.title}
              className="w-full object-cover rounded-lg"
              style={{ maxHeight: "80vh" }}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

export default WatchPage;
