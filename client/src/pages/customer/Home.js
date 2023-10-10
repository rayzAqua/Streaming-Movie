import React from 'react'
import Layout from '../../layout/Layout'
import Banner from '../../components/customer/Banner'
import PopularMovies from '../../components/customer/PopularMovies'
import TopRated from '../../components/customer/TopRated'
import Promos from '../../components/customer/Promos';
import { useContext } from 'react'
import AuthContext from '../../context/AuthProvider'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import axiosApiInstance from '../../context/intercepter'
import { useEffect } from 'react'

function Home() {
  const {user}= useContext(AuthContext);
  const param = useLocation();
  const [load, setLoad] = useState(false);
  const [userPayment, setUserPayment] = useState([]);

  async function getUserPayment() {
      const result = await axiosApiInstance.get(axiosApiInstance.defaults.baseURL + `/payment/getNewestPayment`);
      setLoad(true);
      setUserPayment(result?.data);
      if(result?.data){
        localStorage.setItem("payment", JSON.stringify(result.data));
      }
  }
  useEffect(() => {
    if(user){
      getUserPayment();
    }
  }, [param,load]);
  return (
    <Layout>
      <div className='container mx-auto min-h-screen px-2 mb-6'>
        <Banner/>
        <PopularMovies/>
        <Promos/>
        <TopRated/>
      </div>
    </Layout>
  )
}

export default Home