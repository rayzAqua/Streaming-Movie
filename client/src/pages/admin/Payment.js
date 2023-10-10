import React from 'react'
import { useState } from 'react';
import AdminLayout from '../../layout/AdminLayout';
import { MdAddCircle } from 'react-icons/md';
import axiosApiInstance from '../../context/intercepter';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { TbLock, TbLockOpen } from 'react-icons/tb';
import { toast } from 'react-toastify';
import { BiSolidError } from 'react-icons/bi';
import { BsFillCheckCircleFill } from 'react-icons/bs';


function Payment() {
    const param = useLocation();
    const [load, setLoad] = useState(false);
    const [loadDetail, setLoadDetail] = useState(false);

    const [title, setTitle] = useState("");
    const Head = "text-xs text-center text-main font-semibold px-6 py-2 uppercase";
    const Text = "text-sm text-center leading-6 whitespace-nowrap px-5 py-3";
    const [payments, setPayments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage,setLastPage] = useState(1);
    const [paymentsPerPage] = useState(10);
    const indexOfLastPayment = currentPage * paymentsPerPage;
    const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
    const currentPayment = payments.slice(indexOfFirstPayment, indexOfLastPayment);

    const paginateFront = () => setCurrentPage(currentPage + 1);
    const paginateBack = () => setCurrentPage(currentPage - 1);
    async function getPayment() {
        const result = await axiosApiInstance.get(axiosApiInstance.defaults.baseURL + `/payment/getAll`);
        
        setLoad(true);
        setPayments(result?.data);
    }

    function formatDate(dateString) {
        const formattedDate = new Date(dateString);
        return format(formattedDate, 'dd/MM/yyyy HH:mm:ss');
    }

    const handleBlock = async (e) => {
        try {
          const id = e.currentTarget.getAttribute("data-id");
          const response = await axiosApiInstance.put(`/payment/edit/status/${id}`);
          if (response?.status === 200 || response?.status === 201) {
            toast.success(response?.data.msg);
            getPayment();
          } else {
            toast.error(response?.data?.message + "! Vui lòng thử lại");
          }
        } catch (error) {
          console.error("Lỗi khi gọi API:", error);
          toast.error("Đã xảy ra lỗi khi gọi API. Vui lòng thử lại sau.");
        }
      };



    useEffect(() => {
        getPayment();
        payments.length%10==0? setLastPage(Math.floor(payments.length/10)):setLastPage(Math.floor(payments.length/10)+1);
    }, [param,load]);


  return (
    <AdminLayout>
        <>
        <div className='col-span-6 rounded-md bg-dry border border-gray-800 p-6'>
            <div className='flex flex-col gap-6'>
                <div className='flex-btn gap-2'>
                    <h2 className='text-xl font-bold'>Payment</h2>
                    <div className='flex flex-row'>
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
                              Email
                          </th>
                          <th scope='col' className={`${Head}`}>
                              Pricing/Film Name
                          </th>
                          <th scope='col' className={`${Head}`}>
                              Paid
                          </th>
                          <th scope='col' className={`${Head}`}>
                              Created At
                          </th>
                          <th scope='col' className={`${Head}`}>
                              End Date
                          </th>
                          <th scope='col' className={`${Head}`}>
                              Status
                          </th>
                          <th scope='col' className={`${Head}`}>
                              Action
                          </th>
                      </tr>
                  </thead>
                  <tbody className='bg-main divide-y divide-gray-800'>
                        {payments.map((payment,index)=>(
                            <tr key={payment.id}>
                                <td className={`${Text} truncate`}>{(currentPage-1)*10+index+1}</td>
                                <td className={`${Text}`}>{payment.user_email}</td>
                                <td className={`${Text}`}>{(payment.film_name==null)? payment.pricing_name:payment.film_name}</td>
                                <td className={`${Text}`}>{payment.pay}</td>
                                <td className={`${Text}`}>{formatDate(payment.created_at)}</td>
                                <td className={`${Text}`}>{formatDate(payment.end_date)}</td>
                                <td className={`${Text}`}>{payment.status==0?"Had not pay":"Paid"}</td> 
                                <td className={`${Text} flex-rows gap-2 mt-2`}>
                                    <button type='button' data-id={payment.id} onClick={handleBlock} className={`border border-white ${payment.status ==0?"bg-subMain ":"bg-green-400"} flex-rows gap-2 text-white rounded py-1 px-2`}>
                                        {!payment.status==1?<BiSolidError className='w-6 h-6'/>:<BsFillCheckCircleFill className='w-6 h-6'/>}
                                    </button>
                                </td>
                            </tr>
                        ))}
                  </tbody>
              </table>
          </div>
        </div>
        
        </>
    </AdminLayout>
  )
}

export default Payment