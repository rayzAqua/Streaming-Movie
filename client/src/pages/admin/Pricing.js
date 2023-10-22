import React, { useState } from 'react'
import { FaEdit } from 'react-icons/fa';
import AdminLayout from '../../layout/AdminLayout';
import { MdAddCircle } from 'react-icons/md';
import axiosApiInstance from './../../context/intercepter';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { GiCancel } from 'react-icons/gi';
import { TbLock, TbLockOpen } from 'react-icons/tb';

function Pricing() {
    const param = useLocation();

    const [load, setLoad] = useState(false);
    const [show, setShow] = useState(false);
    const [pricing, setPricing] = useState([]);
    const [form, setForm] = useState();
    const [pricing_name, setName] = useState();
    const [id, setID] = useState();
    const [price, setPrice] = useState();
    const [day, setDay] = useState();
    const [status, setStatus] = useState(true);
    const [change, setChange] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage,setLastPage] = useState(1);
    const [pricingPerPage] = useState(10);
    const indexOfLastPricing = currentPage * pricingPerPage;
    const indexOfFirstPricing = indexOfLastPricing - pricingPerPage;
    const currentPricing = pricing.slice(indexOfFirstPricing, indexOfLastPricing);
  
    const paginateFront = () => setCurrentPage(currentPage + 1);
    const paginateBack = () => setCurrentPage(currentPage - 1);
  
    async function getPricing() {
        const result = await axiosApiInstance.get(axiosApiInstance.defaults.baseURL + `/pricing/getAll`);
        setLoad(true);
        setPricing(result?.data);
    }
  
    useEffect(() => {
        getPricing();
        pricing.length%10==0? setLastPage(Math.floor(pricing.length/10)):setLastPage(Math.floor(pricing.length/10)+1);
      }, [param,load]);
      
      
      
      const [title, setTitle] = useState("");
      const Head = "text-xs text-center text-main font-semibold px-6 py-2 uppercase";
      const Text = "text-sm text-center leading-6 whitespace-nowrap px-5 py-3";
      
      const handleClose = () => {
        setShow(false);
        setName(null);
        setID(null);
        setPrice(null);
        setDay(null);
        setStatus(true);
      }
      const handleInfo = (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        const name = e.currentTarget.getAttribute("data-name");
        const price = e.currentTarget.getAttribute("data-price");
        const days = e.currentTarget.getAttribute("data-days");
        const status = e.currentTarget.getAttribute("data-status");

        setForm("edit");
        setTitle("Edit Pricing");
        setName(name);
        setID(id);
        setPrice(price);
        setDay(days);
        setStatus(status);
        setShow(true);
    }
    const handleShowAdd = (e) => {
        setName(null);
        setID(null);
        setPrice(null);
        setDay(null);
        setStatus(true);
        setForm("add");
        setShow(true);
        setTitle("Add Pricing")
    }

    const handleBlock = async (e) => {
        try {
          const id = e.currentTarget.getAttribute("data-id");
          const response = await axiosApiInstance.put(`/pricing/edit/status/${id}`);
          if (response?.status === 200 || response?.status === 201) {
            toast.success(response?.data.msg);
            getPricing();
          } else {
            toast.error(response?.data?.message + "! Please try again");
          }
        } catch (error) {
          console.error("Error when call API:", error);
          toast.error("Error when call API. Please try again");
        }
      };
  
    const handleSubmit = async (e) => {
        if (!pricing_name && !price && !day) {
          toast.error("Error name empty");
          return;
        }
        e.preventDefault();
        const payload = {
            name: pricing_name,
            price: parseInt(price),
            days: parseInt(day),
            status: JSON.parse(status)
        }
        const query = form === "add" ? await axiosApiInstance.post(axiosApiInstance.defaults.baseURL + `/pricing/create`, payload) :
            await axiosApiInstance.put(axiosApiInstance.defaults.baseURL + `/pricing/edit/${id}`, payload);
        if (query?.status === 200 || query?.status === 201)
            {
              toast.success(query?.data.msg);
              console.log(query);
            }
        else
            toast.error(query?.data?.message + "! Please try again");
          
        getPricing();
        
        setChange(!change);
        setShow(false);
        setName(null);
        setLoad(false);
    }



  return (
    <AdminLayout>
        <>
        <div className='col-span-6 rounded-md bg-dry border border-gray-800 p-6'>
            <div className='flex flex-col gap-6'>
                <div className='flex-btn gap-2'>
                    <h2 className='text-xl font-bold'>Pricing</h2>
                    <div className='flex flex-row'>
                        <button type="button" onClick={handleShowAdd} className='bg-main font-medium transitions hover:bg-green-400 border border-green-400 text-green-400 hover:text-white py-3 px-6 rounded ml-2 flex flex-row'>
                            <MdAddCircle className='w-6 h-6 mr-1'/> Add Pricing
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
                              Pricing Name
                          </th>
                          <th scope='col' className={`${Head}`}>
                              Price
                          </th>
                          <th scope='col' className={`${Head}`}>
                              Days
                          </th>
                          <th scope='col' className={`${Head}`}>
                              Action
                          </th>
                      </tr>
                  </thead>
                  <tbody className='bg-main divide-y divide-gray-800'>
                        {
                            currentPricing.map((p,index)=>(
                                <tr key={p.id}>
                                    <td className={`${Text} truncate`}>{(currentPage-1)*10+index+1}</td>
                                    <td className={`${Text}`}>{p.name}</td>
                                    <td className={`${Text}`}>{p.price}</td>
                                    <td className={`${Text}`}>{p.days}</td>
                                    <td className={`${Text} flex-rows gap-2 mt-2`}>
                                    <button type='button' 
                                        data-id={p.id}
                                        data-name={p.name}
                                        data-price={p.price}
                                        data-days={p.days} 
                                        data-status={p.status}
                                        onClick={handleInfo} className='border border-white bg-yellow-200 flex-rows gap-2 text-main rounded py-1 px-2'>
                                        <FaEdit className='w-6 h-6'/>
                                    </button>
                                    <button type='button' data-id={p.id} onClick={handleBlock} className='border border-white bg-subMain flex-rows gap-2 text-white rounded py-1 px-2'>
                                        {!p.status?<TbLock className='w-6 h-6'/>:<TbLockOpen className='w-6 h-6'/>}
                                    </button>
                                    </td>
                                </tr>
                            ))
                        }
                        
                  </tbody>
              </table>
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
                            Pricing Name
                            </label>
                            <input
                            value={pricing_name}
                            onChange={(e) => setName(e.target.value)}
                            className="shadow bg-main appearance-none rounded w-full py-2 px-1 border border-border text-white" />
                            <label className="block text-dryGray text-sm font-medium mb-1">
                            Price
                            </label>
                            <input
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="shadow bg-main appearance-none rounded w-full py-2 px-1 border border-border text-white" />
                            <label className="block text-dryGray text-sm font-medium mb-1">
                            Days
                            </label>
                            <input
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            className="shadow bg-main appearance-none rounded w-full py-2 px-1 border border-border text-white" />
                            <label className="block text-dryGray text-sm font-medium mb-1">
                            Status
                            </label>
                            <select 
                            value={status} // Đặt giá trị đã chọn vào state
                            onChange={(e) => setStatus(e.target.value)}
                            className="shadow bg-main appearance-none rounded w-full py-2 px-1 border border-border text-white">
                            <option value={true}>Active</option>
                            <option value={false}>Inactive</option>
                            </select>
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
        </div>
        
        </>
    </AdminLayout>  
    )
}

export default Pricing