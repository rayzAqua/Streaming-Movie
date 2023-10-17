import React, { useState } from "react";
import Layout from "../../layout/Layout";
import Filter from "../../components/customer/Filter";
import MovieCard from "../../components/customer/MovieCard";
import { CgSpinner } from "react-icons/cg";
import axios from "../../api/axios";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../context/AuthProvider";
import { useEffect } from "react";
import axiosApiInstance from "../../context/intercepter";

function MoviesPage() {
  const param = useLocation();
  const [load, setLoad] = useState(false);
  const [loadFavorite, setLoadFavorite] = useState(false);

  const { user } = useContext(AuthContext);
  const [favoriteFilm, setFavoriteFilm] = useState([]);
  const [activeFilm, setActiveFilm] = useState([]);

  async function getFavoriteId() {
    try {
      const response = await axiosApiInstance.get(
        axiosApiInstance.defaults.baseURL + `/films/getFavoriteFilms`
      );
      const favoriteIds = response.data.map((film) => film.id);
      setFavoriteFilm(favoriteIds);
    } catch (error) {
      setFavoriteFilm([]);
    }
    setLoadFavorite(true);
  }

  async function getActiveFilm() {
    const result = await axios.get(axios.defaults.baseURL + `/films/getActive`);
    setActiveFilm(result?.data);
    setLoad(true);
  }

  const maxpage = 10;
  const [page, setPage] = useState(maxpage);
  const HandleLoadingMore = () => {
    setPage(page + maxpage);
  };

  useEffect(() => {
    getActiveFilm();
  }, [param, load]);
  useEffect(() => {
    if (user != null) {
      getFavoriteId();
    }
  }, [param, loadFavorite]);

  return (
    <Layout>
      <div className="min-h-screen container mx-auto px-2 my-6">
        <Filter />
        <p className="text-lg font-medium my-6">
          Total{" "}
          <span className="font-bold text-subMain">{activeFilm?.length}</span>{" "}
          items Found
        </p>
        <div className="grid sm:mt-10 mt-6 xl:grid-cols-4 2xl:grid-cols-5 lg:grid-cols-3 sm:grid-cols-2 gap-6">
          {activeFilm.map((movie, index) => (
            <MovieCard
              key={index}
              movie={movie}
              favoriteFilm={favoriteFilm}
              setFavoriteFilm={setFavoriteFilm}
              user={user}
            />
          ))}
        </div>
        {/*Loading More*/}
        <div className="w-full flex-colo md:my-20 my-10">
          <button
            onClick={HandleLoadingMore}
            className="flex-rows gap-3 text-white py-3 px-8 rounded font-semibold border-2 border-subMain"
          >
            Loading More <CgSpinner className="animate-spin" />
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default MoviesPage;
