import React from "react";
import AdminLayout from "../../layout/AdminLayout";
import { MdAddCircle } from "react-icons/md";
import { useState } from "react";
import { GiCancel } from "react-icons/gi";
import { TbLock, TbLockOpen } from "react-icons/tb";
import { FaEdit } from "react-icons/fa";
import axios from "../../api/axios";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import axiosApiInstance from "../../context/intercepter";
import { useEffect } from "react";
import { RiUserStarFill } from "react-icons/ri";
import Pagination from "../../components/Pagination";

function AdminMovies() {
  const param = useLocation();

  const [load, setLoad] = useState(false);
  const [loadGenre, setLoadGenre] = useState(false);
  const [loadActor, setLoadActor] = useState(false);
  const [loadActorFilm, setLoadActorFilm] = useState(false);
  const [show, setShow] = useState(false);
  const [listActorShow, setListActorShow] = useState(false);
  const [film, setFilm] = useState([]);
  const [genre, setGenre] = useState([]);
  const [actor, setActor] = useState([]);
  const [actorFilm, setActorFilm] = useState([]);
  const [selectedActors, setSelectedActors] = useState([]);

  const [photo, setPhoto] = useState();
  const [filePhoto, setFilePhoto] = useState();
  const [video, setVideo] = useState();
  const [fileVideo, setFileVideo] = useState();
  const [form, setForm] = useState();

  const [film_name, setName] = useState();
  const [length, setLength] = useState();
  const [productionYear, setProductionYear] = useState();
  const [decription, setDecription] = useState();
  const [price, setPrice] = useState();
  const [genreID, setGenreID] = useState(0);
  const [status, setStatus] = useState(true);
  const [id, setID] = useState();

  const [change, setChange] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filmsPerPage] = useState(10);
  const indexOfLastFilms = currentPage * filmsPerPage;
  const indexOfFirstFilms = indexOfLastFilms - filmsPerPage;
  const currentFilm = film.slice(indexOfFirstFilms, indexOfLastFilms);

  const [loading, setLoading] = useState(false);

  const paginateFront = () => setCurrentPage(currentPage + 1);
  const paginateBack = () => setCurrentPage(currentPage - 1);

  async function getFilms() {
    const result = await axiosApiInstance.get(
      axiosApiInstance.defaults.baseURL + `/films/getAll`
    );
    setLoad(true);
    setFilm(result?.data);
  }
  async function getGenre() {
    const result = await axiosApiInstance.get(
      axiosApiInstance.defaults.baseURL + `/genres/getAll`
    );
    setLoadGenre(true);
    setGenre(result?.data);
  }
  async function getActor() {
    const result = await axiosApiInstance.get(
      axiosApiInstance.defaults.baseURL + `/actors/getAll`
    );
    setLoadActor(true);
    setActor(result?.data);
  }
  async function getActorFilm(id) {
    const result = await axiosApiInstance.get(
      axiosApiInstance.defaults.baseURL + `/actors/getFromFilm/${id}`
    );
    setLoad(true);
    setActorFilm(result?.data);
  }

  const handleCheckboxChange = async (actorId) => {
    if (selectedActors.includes(actorId)) {
      try {
        await axiosApiInstance.delete(`/films/deleteActor/${id}/${actorId}`);
        setSelectedActors(selectedActors.filter((ident) => ident !== actorId));
        toast.success("Actor removed from film");
      } catch (error) {
        toast.error("Error removing actor from film");
        console.log(error);
      }
    } else {
      try {
        await axiosApiInstance.post(`/films/addActors/${id}/${actorId}`);
        setSelectedActors([...selectedActors, actorId]);
        toast.success("Actor added to film");
      } catch (error) {
        toast.error("Error adding actor to film");
        console.log(error);
      }
    }
  };

  const handleActorShow = async (e) => {
    setListActorShow(true);
    const id = e.currentTarget.getAttribute("data-id");
    setID(id);

    try {
      const result = await axiosApiInstance.get(`/actors/getFromFilm/${id}`);
      setLoadActorFilm(true);
      setActorFilm(result?.data);

      // Extract actor IDs from the fetched data
      const actorIds = result?.data.map((actor) => actor.id);
      setSelectedActors(actorIds);
    } catch (error) {
      console.error("Error fetching actor film data:", error);
    }
  };

  const handleActorClose = () => {
    setSelectedActors([]);
    setListActorShow(false);
    setActorFilm([]);
    setID(null);
  };

  useEffect(() => {
    getFilms();
    film.length % 10 == 0
      ? setLastPage(Math.floor(film.length / 10))
      : setLastPage(Math.floor(film.length / 10) + 1);
  }, [param, load]);

  useEffect(() => {
    if (id) getActorFilm(id);
  }, [param, loadActorFilm]);

  useEffect(() => {
    getGenre();
  }, [param, loadGenre]);

  useEffect(() => {
    getActor();
  }, [param, loadActor]);

  const [title, setTitle] = useState("");
  const Head =
    "text-xs text-center text-main font-semibold px-6 py-2 uppercase";
  const Text = "text-sm text-center leading-6 whitespace-nowrap px-5 py-3";

  const handleClose = () => {
    setShow(false);
    setName(null);
    setID(null);
    setPhoto(null);
    setFilePhoto(null);
    setVideo(null);
    setFileVideo(null);
    setDecription(null);
    setLength(null);
    setGenreID(null);
    setPrice(null);
    setProductionYear(null);
    setStatus(true);
  };

  const handleBlock = async (e) => {
    try {
      const id = e.currentTarget.getAttribute("data-id");
      const response = await axiosApiInstance.put(`/films/edit/status/${id}`);

      if (response?.status === 200 || response?.status === 201) {
        toast.success(response?.data.msg);
        getFilms();
      } else {
        toast.error(response?.data?.message + "! Try again");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      toast.error("Error when call API. Please try again.");
    }
  };

  const handleInfo = (e) => {
    const id = e.currentTarget.getAttribute("data-id");
    const name = e.currentTarget.getAttribute("data-name");
    const decription = e.currentTarget.getAttribute("data-decription");
    const photo = e.currentTarget.getAttribute("data-photo");
    const length = e.currentTarget.getAttribute("data-length");
    const productionYear = e.currentTarget.getAttribute("data-productionYear");
    const video = e.currentTarget.getAttribute("data-video");
    const price = e.currentTarget.getAttribute("data-price");
    const genreId = e.currentTarget.getAttribute("data-genreID");
    const status = e.currentTarget.getAttribute("data-status");
    setForm("edit");
    setTitle("Edit Film");
    setDecription(decription);
    setName(name);
    setID(id);
    setPhoto(photo);
    setLength(length);
    setProductionYear(productionYear);
    setVideo(video);
    setPrice(price);
    setGenreID(genreId);
    setStatus(status);
    setShow(true);
  };

  const handleShowAdd = (e) => {
    setName(null);
    setPhoto(null);
    setFilePhoto(null);
    setVideo(null);
    setFileVideo(null);
    setDecription(null);
    setLength(null);
    setGenreID(null);
    setPrice(null);
    setProductionYear(null);
    setStatus(true);
    setID(null);
    setForm("add");
    setShow(true);
    setTitle("Add Film");
  };

  const handleFilePhotoChange = (e) => {
    const selectedFile = e.target.files[0];
    setFilePhoto(selectedFile);
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!filePhoto) {
      toast.error("Vui lòng chọn tệp ảnh");
      return;
    }

    const formData = new FormData();
    formData.append("photo", filePhoto);

    try {
      setLoading(true);
      const response = await axios.post(
        axios.defaults.baseURL + `/upload/photo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response?.data.message === "Upload success") {
        toast.success("Tải ảnh lên thành công");
        setPhoto(response.data.picture_url.toString());
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      }

      setLoading(false);
      // Sau khi hoàn thành, bạn có thể làm sạch trạng thái file
      setFilePhoto(null);
    } catch (error) {
      setLoading(false);
      toast.error("Đã xảy ra lỗi khi tải ảnh lên. Vui lòng thử lại.");
    }
  };

  const [loadingVideo, setLoadingVideo] = useState(false);

  const handleFileVideoChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileVideo(selectedFile);
  };

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!fileVideo) {
      toast.error("Vui lòng chọn tệp ảnh");
      return;
    }

    const formData = new FormData();
    formData.append("video_file", fileVideo);

    try {
      setLoadingVideo(true);
      const response = await axios.post(
        axios.defaults.baseURL + `/upload/video`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response?.data.message === "Upload success") {
        toast.success("Tải video lên thành công");
        setVideo(response.data.secure_url.toString());
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      }

      // Sau khi hoàn thành, bạn có thể làm sạch trạng thái file
      setLoadingVideo(false);
      setFileVideo(null);
    } catch (error) {
      setLoadingVideo(false);
      toast.error("Đã xảy ra lỗi khi tải video lên. Vui lòng thử lại.");
    }
  };

  const handleSubmit = async (e) => {
    if (
      !film_name ||
      !length ||
      !decription ||
      genreID == 0 ||
      !price ||
      !productionYear
    ) {
      toast.error("Error empty entity");
      return;
    }
    if (!photo || !video) {
      toast.error("Please upload video film or poster film");
      return;
    }
    if (price <= 0) {
      toast.error("Error price must be positive number");
      return;
    }
    if (productionYear < 1900) {
      toast.error("Production year must over 1900");
      return;
    }
    if (length <= 0) {
      toast.error("Film Length must be positive number");
      return;
    }
    console.log(photo);
    console.log(video);
    console.log("genre", genreID);
    e.preventDefault();
    const payload = {
      title: film_name,
      length: parseInt(length),
      poster: photo.toString(),
      production_year: parseInt(productionYear),
      path: video.toString(),
      description: decription,
      price: parseInt(price),
      genre_id: parseInt(genreID),
      status: JSON.parse(status),
    };
    try {
      const query =
        form === "add"
          ? await axiosApiInstance.post(
              axiosApiInstance.defaults.baseURL + `/films/create`,
              payload
            )
          : await axiosApiInstance.put(
              axiosApiInstance.defaults.baseURL + `/films/edit/${id}`,
              payload
            );

      if (query?.status === 200 || query?.status === 201) {
        toast.success(query?.data.msg);
        getFilms();
      } else {
        toast.error(query?.data?.message + "! Vui lòng thử lại");
      }
    } catch (error) {
      // Xử lý lỗi ở đây
      console.error("Có lỗi xảy ra: ", error);
      // Hiển thị thông báo lỗi cho người dùng nếu cần
      toast.error("Có lỗi xảy ra khi thực hiện tác vụ. Vui lòng thử lại sau.");
    }
    setChange(!change);
    setShow(false);
    setName(null);
    setPhoto(null);
    setFilePhoto(null);
    setVideo(null);
    setFileVideo(null);
    setDecription(null);
    setLength(null);
    setGenreID(null);
    setPrice(null);
    setProductionYear(null);
    setStatus(true);
  };

  return (
    <AdminLayout>
      <>
        <div className="col-span-6 rounded-md bg-dry border border-gray-800 p-6">
          <div className="flex flex-col gap-6">
            <div className="flex-btn gap-2">
              <h2 className="text-xl font-bold">Movies</h2>
              <div className="flex flex-row">
                <button
                  type="button"
                  onClick={handleShowAdd}
                  className="bg-main font-medium transitions hover:bg-green-400 border border-green-400 text-green-400 hover:text-white py-3 px-6 rounded ml-2 flex flex-row"
                >
                  <MdAddCircle className="w-6 h-6 mr-1" /> Add Movie
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 my-5">
          <div className="overflow-x-scroll overflow-hidden relative w-full rounded-lg">
            <table className="w-full table-auto border border-border divide-y divide-border">
              <thead>
                <tr className="bg-dryGray">
                  <th scope="col" className={`${Head}`}>
                    Movie ID
                  </th>
                  <th scope="col" className={`${Head}`}>
                    Movie Name
                  </th>
                  <th scope="col" className={`${Head}`}>
                    Poster
                  </th>
                  <th scope="col" className={`${Head}`}>
                    Genre
                  </th>
                  <th scope="col" className={`${Head}`}>
                    Year
                  </th>
                  <th scope="col" className={`${Head}`}>
                    Minutes
                  </th>
                  <th scope="col" className={`${Head}`}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-main divide-y divide-gray-800">
                {currentFilm.map((movie, index) => (
                  <tr key={movie.id}>
                    <td className={`${Text} truncate`}>
                      {(currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className={`${Text}`}>{movie.title}</td>
                    <td className={`${Text}`}>
                      <div className="w-12 bg-dry border border-border h-12 rounded overflow-hidden">
                        <img
                          className="h-12 w-12 object-cover"
                          src={`${movie.poster}`}
                          alt={movie?.title}
                        />
                      </div>
                    </td>
                    <td className={`${Text}`}>{movie.genre.name}</td>
                    <td className={`${Text}`}>{movie.production_year}</td>
                    <td className={`${Text}`}>{movie.length}</td>

                    <td className={`${Text} flex-rows gap-2 mt-2`}>
                      <button
                        type="button"
                        data-id={movie.id}
                        data-name={movie.title}
                        data-decription={movie.description}
                        data-photo={movie.poster.toString()}
                        data-length={movie.length}
                        data-productionYear={movie.production_year}
                        data-video={movie.path.toString()}
                        data-price={movie.price}
                        data-genreID={movie.genre_id}
                        data-status={movie.status}
                        onClick={handleInfo}
                        className="border border-white bg-yellow-200 flex-rows gap-2 text-main rounded py-1 px-2"
                      >
                        <FaEdit className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        data-id={movie.id}
                        onClick={handleBlock}
                        className="border border-white bg-subMain flex-rows gap-2 text-white rounded py-1 px-2"
                      >
                        {!movie.status ? (
                          <TbLock className="w-6 h-6" />
                        ) : (
                          <TbLockOpen className="w-6 h-6" />
                        )}
                      </button>
                      <button
                        type="button"
                        data-id={movie.id}
                        onClick={handleActorShow}
                        className="border border-white bg-green-400 flex-rows gap-2 text-white rounded py-1 px-2"
                      >
                        <RiUserStarFill className="w-6 h-6" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {show ? (
          <>
            <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
              <div className="relative w-auto my-6 mx-auto max-w-3xl">
                <div className="border border-white rounded-lg shadow-lg relative flex flex-col w-full bg-dry outline-none focus:outline-none">
                  <div className="flex items-start justify-between p-5 rounded-t ">
                    <h3 className="text-3xl font=semibold">{title}</h3>
                    <button
                      className="bg-transparent border-0 text-black float-right"
                      onClick={handleClose}
                    >
                      <GiCancel className="text-white h-6 w-6 text-xl blockpy-0" />
                    </button>
                  </div>
                  <div className="relative p-6 flex-auto">
                    <form className="shadow-md rounded px-8 pt-6 pb-8 w-full">
                      <label className="block text-dryGray text-sm font-medium mb-1">
                        Movie Name
                      </label>
                      <input
                        required
                        value={film_name}
                        onChange={(e) => setName(e.target.value)}
                        className="shadow bg-main appearance-none rounded w-full py-2 px-1 border border-border text-white"
                      />
                      <label className="block text-dryGray text-sm font-medium mb-1">
                        Poster
                      </label>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFilePhotoChange(e)}
                          className="shadow bg-main appearance-none rounded w-full py-2 px-1 border border-border text-white"
                        />
                        {filePhoto ? (
                          <>
                            <div class="flex items-center justify-center">
                              {!loading ? (
                                <button
                                  className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mt-5 mb-5"
                                  type="button"
                                  onClick={(e) => handlePhotoUpload(e)}
                                >
                                  Upload
                                </button>
                              ) : (
                                <div className=" mt-3 px-3 py-1 text-xs font-medium leading-none text-center text-blue-800 bg-blue-200 rounded-full animate-pulse dark:bg-blue-900 dark:text-blue-200">
                                  Loading...
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                      <label className="block text-dryGray text-sm font-medium mb-1">
                        Decription
                      </label>
                      <textarea
                        required
                        value={decription}
                        onChange={(e) => setDecription(e.target.value)}
                        className="resize-none shadow bg-main appearance-none rounded w-full py-2 px-1 border border-border text-white"
                        rows={2} // Đặt số dòng
                      />

                      <label className="block text-dryGray text-sm font-medium mb-1">
                        Length
                      </label>
                      <input
                        type="number"
                        required
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="shadow bg-main appearance-none rounded w-full py-2 px-1 border border-border text-white"
                      />
                      <label className="block text-dryGray text-sm font-medium mb-1">
                        Production Year
                      </label>
                      <input
                        type="number"
                        required
                        value={productionYear}
                        onChange={(e) => setProductionYear(e.target.value)}
                        className="shadow bg-main appearance-none rounded w-full py-2 px-1 border border-border text-white"
                      />
                      <label className="block text-dryGray text-sm font-medium mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="shadow bg-main appearance-none rounded w-full py-2 px-1 border border-border text-white"
                      />
                      <label className="block tsext-dryGray text-sm font-medium mb-1">
                        Video
                      </label>
                      <div>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleFileVideoChange(e)}
                          className="shadow bg-main appearance-none rounded w-full py-2 px-1 border border-border text-white"
                        />
                        {fileVideo ? (
                          <>
                            <div class="flex items-center justify-center">
                              {!loadingVideo ? (
                                <button
                                  className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mt-5 mb-5"
                                  type="button"
                                  onClick={(e) => handleVideoUpload(e)}
                                >
                                  Upload
                                </button>
                              ) : (
                                <div className=" mt-3 px-3 py-1 text-xs font-medium leading-none text-center text-blue-800 bg-blue-200 rounded-full animate-pulse dark:bg-blue-900 dark:text-blue-200">
                                  Loading...
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                      <label className="block text-dryGray text-sm font-medium mb-1">
                        Genre
                      </label>
                      <select
                        value={genreID} // Đặt giá trị đã chọn vào state
                        onChange={(e) => setGenreID(e.target.value)}
                        className="shadow bg-main appearance-none rounded w-full py-2 px-1 border border-border text-white"
                      >
                        <option key={0} value={0}>
                          Choose genre
                        </option>
                        {genre.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                      <label className="block text-dryGray text-sm font-medium mb-1">
                        Status
                      </label>
                      <select
                        value={status} // Đặt giá trị đã chọn vào state
                        onChange={(e) => setStatus(e.target.value)}
                        className="shadow bg-main appearance-none rounded w-full py-2 px-1 border border-border text-white"
                      >
                        <option value={true}>Active</option>
                        <option value={false}>Inactive</option>
                      </select>
                    </form>
                  </div>
                  <div className="flex items-center justify-end p-6 rounded-b">
                    <button
                      className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                      type="button"
                      disabled={
                        loading ? loading : loadingVideo ? loadingVideo : false
                      }
                      onClick={handleClose}
                    >
                      Close
                    </button>
                    <button
                      className="text-white bg-green-500 active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                      type="button"
                      disabled={
                        loading ? loading : loadingVideo ? loadingVideo : false
                      }
                      onClick={handleSubmit}
                    >
                      {loading
                        ? `Waiting For Upload`
                        : loadingVideo
                        ? `Waiting For Upload`
                        : `Submit`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
        {listActorShow ? (
          <>
            <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
              <div className="relative w-auto my-6 mx-auto max-w-3xl">
                <div className="border border-white rounded-lg shadow-lg relative flex flex-col w-full bg-dry outline-none focus:outline-none">
                  <div className="flex items-start justify-between p-5 rounded-t ">
                    <h3 className="text-3xl font=semibold">Actor List</h3>
                    <button
                      className="bg-transparent border-0 text-black float-right"
                      onClick={handleActorClose}
                    >
                      <GiCancel className="text-white h-6 w-6 text-xl blockpy-0" />
                    </button>
                  </div>
                  <div className="relative p-6 flex-auto">
                    <form className="shadow-md rounded px-8 pt-6 pb-8 w-full">
                      {actor.map((actorItem) => (
                        <div
                          key={actorItem.id}
                          className="mb-[0.125rem] block min-h-[1.5rem] pl-[1.5rem]"
                        >
                          <input
                            type="checkbox"
                            className="your-checkbox-styles"
                            checked={selectedActors.includes(actorItem.id)}
                            onChange={() => handleCheckboxChange(actorItem.id)}
                          />
                          <label className="inline-block pl-[0.15rem] hover:cursor-pointer">
                            {actorItem.name}
                            <img
                              className="h-12 w-12 object-cover"
                              src={`${actorItem.photo}`}
                              alt={actorItem.name}
                            />
                          </label>
                        </div>
                      ))}
                    </form>
                  </div>
                  <div className="flex items-center justify-end p-6 rounded-b">
                    <button
                      className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                      type="button"
                      onClick={handleActorClose}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
        <div className="flex flex-row-reverse mx-5">
          <Pagination
            itemsPerPage={filmsPerPage}
            totalItems={film.length}
            paginateFront={paginateFront}
            paginateBack={paginateBack}
            currentPage={currentPage}
            lastPage={lastPage}
          />
        </div>
      </>
    </AdminLayout>
  );
}

export default AdminMovies;
