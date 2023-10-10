import React, { useEffect } from 'react'
import { useState } from 'react';
import AdminLayout from '../../layout/AdminLayout';
import { MdAddCircle } from 'react-icons/md';
import { FaEdit } from 'react-icons/fa';
import { GiCancel } from 'react-icons/gi';
import { useLocation } from 'react-router-dom';
import axiosApiInstance from '../../context/intercepter';
import { toast } from 'react-toastify';
import axios from './../../api/axios';
import Pagination from '../../components/Pagination';

function Actor() {
  const param = useLocation();

  const [load, setLoad] = useState(false);
  const [show, setShow] = useState(false);
  const [actor, setActor] = useState([]);
  const [photo, setPhoto] = useState();
  const [file, setFile] = useState();
  const [form, setForm] = useState();
  const [actor_name, setName] = useState();
  const [id, setID] = useState();
  const [change, setChange] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage,setLastPage] = useState(1);
  const [actorsPerPage] = useState(10);
  const indexOfLastActors = currentPage * actorsPerPage;
  const indexOfFirstActor = indexOfLastActors - actorsPerPage;
  const currentActors = actor.slice(indexOfFirstActor, indexOfLastActors);


  const paginateFront = () => setCurrentPage(currentPage + 1);
  const paginateBack = () => setCurrentPage(currentPage - 1);

  async function getActors() {
      const result = await axiosApiInstance.get(axiosApiInstance.defaults.baseURL + `/actors/getAll`);
      setLoad(true);
      setActor(result?.data);
  }

  useEffect(() => {
      getActors();
      actor.length%10==0? setLastPage(Math.floor(actor.length/10)):setLastPage(Math.floor(actor.length/10)+1);
    }, [param,load]);
    
    
    const [title, setTitle] = useState("");
    const Head = "text-xs text-center text-main font-semibold px-6 py-2 uppercase";
    const Text = "text-sm text-center leading-6 whitespace-nowrap px-5 py-3";
    
    const handleClose = () => {
      setShow(false);
      setName(null);
      setPhoto(null);
      setFile(null);
    }
    const handleInfo = (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      const name = e.currentTarget.getAttribute("data-name");
      const photo = e.currentTarget.getAttribute("data-photo");

      setForm("edit");
      setTitle("Edit Actor");
      setName(name);
      setID(id);
      setPhoto(photo);
      setShow(true);
    }

    const handleShowAdd = (e) => {
      setName(null);
      setPhoto(null);
      setID(null);
      setForm("add");
      setShow(true);
      setTitle("Add Actor")
    }

    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
    };
  
    const handlePhotoUpload = async () => {
      if (!file) {
        toast.error("Vui lòng chọn tệp ảnh");
        return;
      }
  
      const formData = new FormData();
      formData.append("photo", file);
  
      try {
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
  
        // Sau khi hoàn thành, bạn có thể làm sạch trạng thái file
      } catch (error) {
        toast.error("Đã xảy ra lỗi khi tải ảnh lên. Vui lòng thử lại.");
      }
    };
    
    
    

  const handleSubmit = async (e) => {
      if (!actor_name && !photo) {
        toast.error("Error Name or photo empty");
        return;
      }
      e.preventDefault();
      const payload = {
          name: actor_name,
          photo: photo.toString()
      }
      const query = form === "add" ? await axiosApiInstance.post(axiosApiInstance.defaults.baseURL + `/actors/create`, payload) :
          await axiosApiInstance.put(axiosApiInstance.defaults.baseURL + `/actors/edit/${id}`, payload);
          if (query?.status === 200 || query?.status ===201)
          {
            toast.success(query?.data.msg);
            getActors();
          }
      else
          toast.error(query?.data?.message + "! Vui lòng thử lại");
      setLoad(false);
      setChange(!change);
      setShow(false);
      setName(null);
      setPhoto(null);
      setFile(null);
  }

  
  return (
    <AdminLayout>
        <>
        <div className='col-span-6 rounded-md bg-dry border border-gray-800 p-6'>
            <div className='flex flex-col gap-6'>
                <div className='flex-btn gap-2'>
                    <h2 className='text-xl font-bold'>Movies</h2>
                    <div className='flex flex-row'>
                        <button type="button" onClick={handleShowAdd} className='bg-main font-medium transitions hover:bg-green-400 border border-green-400 text-green-400 hover:text-white py-3 px-6 rounded ml-2 flex flex-row'>
                            <MdAddCircle className='w-6 h-6 mr-1'/> Add Actor
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
                            ID
                        </th>
                        <th scope='col' className={`${Head}`}>
                            Name
                        </th>
                        <th scope='col' className={`${Head}`}>
                            Photo
                        </th>
                        <th scope='col' className={`${Head}`}>
                            Action
                        </th>
                    </tr>
                </thead>
                  <tbody className='bg-main divide-y divide-gray-800'>
                      {
                        currentActors.map((actor,index)=>(
                          <tr key={actor.id}>
                              <td className={`${Text} truncate`}>{(currentPage-1)*10+index+1}</td>
                              <td className={`${Text}`}>{actor.name}</td>
                              <td className={`${Text}`}>
                                  <div className='w-12 bg-dry border border-border h-12 rounded overflow-hidden'>
                                      <img
                                      className='h-12 w-12 object-cover'
                                      src={`${actor.photo}`}
                                      alt={actor?.name}/>    
                                  </div>
                              </td>
                  
                              <td className={`${Text} flex-rows gap-2 mt-2`}>
                                  <button 
                                    data-id={actor.id}
                                    data-name={actor.name}
                                    data-photo={actor.photo.toString()} 
                                    type='button' onClick={handleInfo} className='border border-white bg-yellow-200 flex-rows gap-2 text-main rounded py-1 px-2'>
                                      <FaEdit/> Edit
                                  </button>
                                  <button className='border border-white bg-subMain flex-rows gap-2 text-white rounded py-1 px-2'>
                                    Films
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
                      Actor Name
                    </label>
                    <input 
                      required
                      value={actor_name}
                      onChange={(e) => setName(e.target.value)}
                      className="shadow bg-main appearance-none rounded w-full py-2 px-1 border border-border text-white" />
                    <label className="block text-dryGray text-sm font-medium mb-1">
                      Photo
                    </label>
                    <div>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="shadow bg-main appearance-none rounded w-full py-2 px-1 border border-border text-white" />
                      {file?
                        <button type='button' onClick={handlePhotoUpload}>Upload</button>
                        :<></>
                      }
                    </div>
                    
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
                    type="button"
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
        <div className="flex flex-row-reverse mx-5">
            <Pagination
                itemsPerPage={actorsPerPage}
                totalItems={actor.length}
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

export default Actor