import React from "react";
import Layout from "../../layout/Layout";
import Banner from "../../components/customer/Banner";
import PopularMovies from "../../components/customer/PopularMovies";
import TopRated from "../../components/customer/TopRated";
import Promos from "../../components/customer/Promos";
import { useContext } from "react";
import AuthContext from "../../context/AuthProvider";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import axiosApiInstance from "../../context/intercepter";
import { useEffect } from "react";
import { toast } from "react-toastify";

function Home() {
  const { user } = useContext(AuthContext);
  const param = useLocation();

  // Check user payment
  useEffect(() => {
    const getUserPayment = async () => {
      try {
        const res = await axiosApiInstance.get(
          axiosApiInstance.defaults.baseURL + `/payment/getNewestPayment`
        );

        if (res && res.data.success) {
          console.log(res.data.msg);
        } else {
          console.log(res.data.msg);
        }
        localStorage.setItem("payment", JSON.stringify(res.data.package));
      } catch (error) {
        if (error.response && error.response.status === 422) {
          toast.error(error.response.data.detail[0].msg);
        } else if (error.response && error.response.status === 500) {
          toast.error(error.response.data.detail);
        } else {
          toast.error("Something is wrong.");
        }
      }
    };

    if (user) {
      getUserPayment();
    }
  }, []);

  return (
    <Layout>
      <div className="container mx-auto min-h-screen px-2 mb-6">
        <Banner />
        <PopularMovies />
        <Promos />
        <TopRated />
      </div>
    </Layout>
  );
}

export default Home;
