import React from 'react'
import Layout from '../../layout/Layout'
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import axios from '../../api/axios';
import { useEffect } from 'react';
import { useContext } from 'react';
import AuthContext from '../../context/AuthProvider';
import { toast } from 'react-toastify';
import axiosApiInstance from '../../context/intercepter';



function Package() {
    const param = useLocation();
    const userPayment = JSON.parse(localStorage.getItem('payment'));
    const [load,setLoad] = useState(false);
    const [pricing, setPricing] = useState([]);
    const {user}= useContext(AuthContext);


    const handleBtn = async (e) => {
        if (userPayment){
            const endDate = new Date(userPayment.end_date); // Ngày cần so sánh
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0)
            if(userPayment.pricing_name != null && endDate>today)
            {
                toast.warn("Already register")
            }
        } else {
            try {
                const id = e.currentTarget.getAttribute("data-id");
                const response = await axiosApiInstance.post(`/payment/forPackage/${id}`);
            
                if (response?.status === 200 || response?.status === 201) {
                  toast.success(response?.data.msg);
                  window.location.href = "/";
                } else {
                  toast.error(response?.data?.message + "Please try again");
                }
              } catch (error) {
                console.error("Lỗi khi gọi API:", error);
                toast.error("Please try again");
              }        
        }
    }

    const handleLogin = async (e) =>{
        window.location.href = "/login";
    }

    async function getPricing(){
        const result = await axios.get(axios.defaults.baseURL + `/pricing/getActive`);
        setPricing(result?.data);
        setLoad(true);
      }
      useEffect(() => {
        getPricing();
    
      }, [param,load]);

  return (
    <Layout>
        <div class="bg-main">
            <div class="container px-6 py-8 mx-auto">
                <h1 class="text-2xl font-semibold text-center text-subMain capitalize lg:text-3xl">Pricing Plan</h1>

                <p class="max-w-2xl mx-auto mt-4 text-center text-dryGray xl:mt-6 dark:text-gray-300">
                    Register package for watching unlimited our Movies on NetMovie
                </p>

                <div class="grid grid-cols-1 gap-8 mt-6 xl:mt-12 xl:gap-12 md:grid-cols-2 lg:grid-cols-3">
                    {pricing.map((p)=>(
                        <div class="w-full p-8 space-y-8 text-center bg-blue-600 rounded-lg">
                            <p class="font-medium text-gray-200 uppercase">{p.name}</p>

                            <h2 class="text-5xl font-bold text-white uppercase dark:text-gray-100">
                                {p.price}{" "}VND
                            </h2>

                            <p class="font-medium text-xl text-gray-200">For {p.days} {'days'}</p>
                            {
                                user?
                                <button type='button' onClick={handleBtn} data-id={p.id} class="block w-full px-4 py-2 mt-10 tracking-wide text-blue-500 capitalize transition-colors duration-300 transform bg-white rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:ring focus:ring-gray-200 focus:ring-opacity-80">
                                    Register Now
                                </button>:
                                <button onClick={handleLogin} class="w-full px-4 py-2 mt-10 tracking-wide text-blue-500 capitalize transition-colors duration-300 transform bg-white rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:ring focus:ring-gray-200 focus:ring-opacity-80">
                                    Register Now
                                </button>

                            }
                        </div>
                    ))}

                </div>
            </div>
        </div>
    </Layout>
  )
}

export default Package