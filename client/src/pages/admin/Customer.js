import React, { useEffect, useState } from "react";
import AdminLayout from '../../layout/AdminLayout'
import { useLocation } from "react-router-dom";
import axiosApiInstance from "../../context/intercepter";
import Pagination from './../../components/Pagination';
import { format } from 'date-fns';

function Customer() {
    const param = useLocation();
    const [load, setLoad] = useState(false);

    const [show, setShow] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage,setLastPage] = useState(1);
    const [customersPerPage] = useState(10);
    const indexOfLastCustomers = currentPage * customersPerPage;
    const indexOfFirstCustomers = indexOfLastCustomers - customersPerPage;
    const currentCustomers = customers.slice(indexOfFirstCustomers, indexOfLastCustomers);

    const paginateFront = () => setCurrentPage(currentPage + 1);
    const paginateBack = () => setCurrentPage(currentPage - 1);

    async function getCustomer() {
        const result = await axiosApiInstance.get(axiosApiInstance.defaults.baseURL + `/user/getCustomer`);
        setLoad(true);
        setCustomers(result?.data);
    }

    function formatDate(dateString) {
    const formattedDate = new Date(dateString);
    return format(formattedDate, 'dd/MM/yyyy HH:mm:ss');
}

    useEffect(() => {
        getCustomer();
        customers.length%10==0? setLastPage(Math.floor(customers.length/10)):setLastPage(Math.floor(customers.length/10)+1);
    }, [param,load]);

    const Head = "text-xs text-center text-main font-semibold px-6 py-2 uppercase";
    const Text = "text-sm text-center leading-6 whitespace-nowrap px-5 py-3";
    
  return (
    <AdminLayout>
        <>
        <div className='col-span-6 rounded-md bg-dry border border-gray-800 p-6'>
            <div className='flex flex-col gap-6'>
                <div className='flex-btn gap-2'>
                    <h2 className='text-xl font-bold'>Customer</h2>
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
                                Name
                            </th>
                            <th scope='col' className={`${Head}`}>
                                Email
                            </th>
                            <th scope='col' className={`${Head}`}>
                                Status
                            </th>
                            <th scope='col' className={`${Head}`}>
                                Create At
                            </th>
                        </tr>
                    </thead>
                    <tbody className='bg-main divide-y divide-gray-800'>
                        {currentCustomers.map((user,index)=> (
                        <tr key={user.id}>
                            <td className={`${Text} truncate`}>{(currentPage-1)*10+index+1}</td>
                            <td className={`${Text}`}>{user.name}</td>
                            <td className={`${Text}`}>{user.email}</td>
                            <td className={`${Text}`}>{user.status==0? "Inactive": (user.status==1?"Active":(user.status==2?"Verify":"ChangePass"))}</td>
                            <td className={`${Text}`}>
                                {formatDate(user.created_at)}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        <div className="flex flex-row-reverse mx-5">
            <Pagination
                itemsPerPage={customersPerPage}
                totalItems={customers.length}
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

export default Customer