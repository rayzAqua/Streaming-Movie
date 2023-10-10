import React, { useState } from "react";
import AdminLayout from '../../layout/AdminLayout'
import {MdAddCircle} from 'react-icons/md'
import {GiCancel} from 'react-icons/gi'
import { FaEdit } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import axiosApiInstance from "../../context/intercepter";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from "../../components/Pagination";


function Genres() {
  const param = useLocation();

  const [load, setLoad] = useState(false);
  const [show, setShow] = useState(false);
  const [genres, setGenres] = useState([]);
  const [form, setForm] = useState();
  const [genre_name, setName] = useState();
  const [id, setID] = useState();
  const [change, setChange] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage,setLastPage] = useState(1);
  const [genresPerPage] = useState(10);
  const indexOfLastGenres = currentPage * genresPerPage;
  const indexOfFirstGenres = indexOfLastGenres - genresPerPage;
  const currentGenres = genres.slice(indexOfFirstGenres, indexOfLastGenres);

  const paginateFront = () => setCurrentPage(currentPage + 1);
  const paginateBack = () => setCurrentPage(currentPage - 1);

  async function getGenre() {
      const result = await axiosApiInstance.get(axiosApiInstance.defaults.baseURL + `/genres/getAll`);
      setLoad(true);
      setGenres(result?.data);
  }

  useEffect(() => {
      getGenre();
      genres.length%10==0? setLastPage(Math.floor(genres.length/10)):setLastPage(Math.floor(genres.length/10)+1);
    }, [param,load]);
    
    
    
    const [title, setTitle] = useState("");
    const Head = "text-xs text-center text-main font-semibold px-6 py-2 uppercase";
    const Text = "text-sm text-center leading-6 whitespace-nowrap px-5 py-3";
    
    const handleClose = () => {
      setShow(false);
      setName(null);
    }
    const handleInfo = (e) => {
      setForm("edit");
      setTitle("Edit Genre");
      setName(e.currentTarget.title);
      setID(e.currentTarget.id);
      setShow(true);
  }
  const handleShowAdd = (e) => {
      setName(null);
      setID(null);
      setForm("add");
      setShow(true);
      setTitle("Add Genre")
  }

  const handleSubmit = async (e) => {
      if (!genre_name) {
        toast.error("Error name empty");
        return;
      }
      e.preventDefault();
      const payload = {
          name: genre_name
      }
      const query = form === "add" ? await axiosApiInstance.post(axiosApiInstance.defaults.baseURL + `/genres/create`, payload) :
          await axiosApiInstance.put(axiosApiInstance.defaults.baseURL + `/genres/edit/${id}`, payload);
      if (query?.status === 200 || query?.status === 201)
          {
            toast.success(query?.data.msg);
          }
      else
          toast.error(query?.data?.message + "! Vui lòng thử lại");
        
      getGenre();
      setLoad(false);
      setChange(!change);
      setShow(false);
      setName(null);
  }

   
  return (
    <AdminLayout>
        <>
        <div className='col-span-6 rounded-md bg-dry border border-gray-800 p-6'>
            <div className='flex flex-col gap-6'>
                <div className='flex-btn gap-2'>
                    <h2 className='text-xl font-bold'>Genres</h2>
                    <div className='flex flex-row'>
                        <button type="button" onClick={handleShowAdd} className='bg-main font-medium transitions hover:bg-green-400 border border-green-400 text-green-400 hover:text-white py-3 px-6 rounded ml-2 flex flex-row'>
                            <MdAddCircle className='w-6 h-6 mr-1'/> Add Genre
                        </button>
                    </div>
                </div>
            </div>
        </div>
          
        <div className='p-5 my-5'>
          <div className='overflow-x-scroll overflow-hidden relative w-full rounded-lg'>
              <table className='w-full table-auto border border-border divide-y divide-border'>
                  <thead>
                      <tr className='bg-dryGray'>
                          <th scope='col' className={`${Head}`}>
                            Ordinal
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
                      {currentGenres.map((genre,index)=> (
                        <tr key={genre.id}>
                          <td className={`${Text} truncate`}>{(currentPage-1)*10+index+1}</td>
                          <td className={`${Text}`}>{genre.name}</td>
                          <td className={`${Text} flex-rows gap-2 mt-2`}>
                              <button id={genre.id} title={genre.name} type='button' onClick={handleInfo} className='border border-white bg-yellow-200 flex-rows gap-2 text-main rounded py-1 px-2'>
                                  <FaEdit/> Edit
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
                    <GiCancel className="text-white h-6 w-6 text-xl blockpy-0"/>
                  </button>
                </div>
                <div className="relative p-6 flex-auto">
                  <form className="shadow-md rounded px-8 pt-6 pb-8 w-full">
                    <label className="block text-dryGray text-sm font-medium mb-1">
                      Genre Name
                    </label>
                    <input
                      value={genre_name}
                      onChange={(e) => setName(e.target.value)}
                      className="shadow bg-main appearance-none rounded w-full py-2 px-1 border border-border text-white" />
                  </form>
                </div>
                <div className="flex items-center justify-end p-6 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                  <button
                    className="text-white bg-green-500 active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                    onClick={handleSubmit}
                  >
                    {form === "edit" ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
        <div className="flex flex-row-reverse mx-5">
            <Pagination
                itemsPerPage={genresPerPage}
                totalItems={genres.length}
                paginateFront={paginateFront}
                paginateBack={paginateBack}
                currentPage={currentPage}
                lastPage={lastPage}
                />
        </div> 
        </>
    </AdminLayout>
  )
}

export default Genres