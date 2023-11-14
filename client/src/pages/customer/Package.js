import React from "react";
import Layout from "../../layout/Layout";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "../../api/axios";
import { useEffect } from "react";
import { useContext } from "react";
import AuthContext from "../../context/AuthProvider";
import { toast } from "react-toastify";
import axiosApiInstance from "../../context/intercepter";
import { useRentMovieContext } from "../../context/RentMovieProvider";

function Package() {
  const [subPackages, setPackages] = useState([]);
  const { user } = useContext(AuthContext);
  const [rentData, setRentData] = useRentMovieContext();
  const navigate = useNavigate();

  // Get package
  useEffect(() => {
    const packageRentData = JSON.parse(localStorage.getItem("rentData"));

    if (packageRentData && packageRentData.package_name) {
      navigate("/payment");
    }

    const getPricing = async () => {
      try {
        const res = await axios.get(
          axios.defaults.baseURL + `/pricing/getActive`
        );

        if (res && res.data.success) {
          console.log(res.data.msg);
          setPackages(res.data.packages);
        } else {
          console.log(res.data.msg);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          toast.error(error.response.data.detail);
        } else if (error.response && error.response.status === 500) {
          toast.error(error.response.data.detail);
        } else {
          toast.error("Something is wrong.");
        }
      }
    };

    getPricing();
  }, [navigate]);

  const userPayment = JSON.parse(localStorage.getItem("payment"));

  const handleBtn = async (e) => {
    try {
      const packageId = e.currentTarget.getAttribute("data-id");
      const packageName = e.currentTarget.getAttribute("data-name");
      const packagePrice = e.currentTarget.getAttribute("data-price");

      console.log(packageId);
      const res = await axiosApiInstance.post(
        `/payment/forPackage/${packageId}`
      );
      if (res && res.data.success) {
        console.log(res.data.msg);
        console.log(res.data.payment);

        if (res.data.payment) {
          const paymentData = {
            package_name: packageName,
            total: packagePrice,
            order_id: res.data.payment.id,
            customer: res.data.payment.customer,
            email: res.data.payment.email,
            hasData: true,
            movie_title: null,
          };
          localStorage.setItem("rentData", JSON.stringify(paymentData));
          setRentData(paymentData);
          toast.success(res.data.msg);
          navigate("/payment");
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.error(error.response.data.detail);
      } else if (error.response && error.response.status === 409) {
        console.log(error.response.data.detail);
        const res = await axiosApiInstance.delete(
          `${axios.defaults.baseURL}/payment/deleteNotPaid`
        );
        if (res && res.data.success) {
          console.log(res.data.msg);
          const packageId = e.currentTarget.getAttribute("data-id");
          const packageName = e.currentTarget.getAttribute("data-name");
          const packagePrice = e.currentTarget.getAttribute("data-price");

          console.log(packageId);
          const res1 = await axiosApiInstance.post(
            `/payment/forPackage/${packageId}`
          );
          if (res1 && res1.data.success) {
            console.log(res1.data.msg);
            console.log(res1.data.payment);

            if (res1.data.payment) {
              const paymentData = {
                package_name: packageName,
                total: packagePrice,
                order_id: res1.data.payment.id,
                customer: res1.data.payment.customer,
                email: res1.data.payment.email,
                hasData: true,
                movie_title: null,
              };
              localStorage.setItem("rentData", JSON.stringify(paymentData));
              setRentData(paymentData);
              toast.success(res1.data.msg);
              navigate("/payment");
            }
          }
        } else {
          console.log(res.data.msg);
        }
      } else if (error.response && error.response.status === 422) {
        toast.error(error.response.data.detail[0].msg);
      } else if (error.response && error.response.status === 500) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Something is wrong.");
      }
    }
  };

  const handleLogin = async (e) => {
    window.location.href = "/login";
  };

  const currentTime = new Date();
  const endTime = userPayment ? new Date(userPayment[0]?.end_date) : null;
  const timeLeftInSeconds = (endTime - currentTime) / 1000;
  const daysLeft = Math.floor(timeLeftInSeconds / (60 * 60 * 24));

  return (
    <Layout>
      <div className="bg-main">
        {subPackages && subPackages.length > 0 ? (
          <div className="container px-6 py-8 mx-auto">
            {!userPayment ||
              userPayment.length === 0 ||
              (!userPayment[0].pricing_name && (
                <>
                  <h1 className="text-2xl font-semibold text-center text-subMain capitalize lg:text-3xl">
                    Pricing Plan
                  </h1>

                  <p className="max-w-2xl mx-auto mt-4 text-center text-dryGray xl:mt-6 dark:text-gray-300">
                    Register package for watching unlimited our Movies on
                    NetMovie
                  </p>
                </>
              ))}
            {userPayment &&
              userPayment.length > 0 &&
              userPayment[0].pricing_name && (
                <>
                  <h1 className="text-2xl font-semibold text-center text-subMain capitalize lg:text-3xl">
                    Your Register
                  </h1>
                </>
              )}
            {!(
              userPayment &&
              userPayment.length > 0 &&
              userPayment[0].pricing_name
            ) ? (
              <div className="grid grid-cols-1 gap-8 mt-6 xl:mt-12 xl:gap-12 md:grid-cols-3">
                {subPackages.map((pack) => (
                  <div
                    key={pack.id}
                    className="w-full p-8 space-y-8 text-center bg-blue-600 rounded-lg"
                  >
                    <p className="font-medium text-gray-200 uppercase">
                      {pack.name}
                    </p>

                    <h2 className="text-5xl font-bold text-white uppercase dark:text-gray-100">
                      {`${pack.price.toLocaleString("VN-vi")} VND`}
                    </h2>

                    <p className="font-medium text-xl text-gray-200">
                      For {pack.days} {"days"}
                    </p>
                    {user ? (
                      <button
                        type="button"
                        onClick={handleBtn}
                        key={pack.id}
                        data-id={pack.id}
                        data-name={pack.name}
                        data-price={pack.price}
                        className="block w-full px-4 py-2 mt-10 tracking-wide text-blue-500 capitalize transition-colors duration-300 transform bg-white rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:ring focus:ring-gray-200 focus:ring-opacity-80"
                      >
                        Register Now
                      </button>
                    ) : (
                      <button
                        key={pack.id}
                        onClick={handleLogin}
                        className="w-full px-4 py-2 mt-10 tracking-wide text-blue-500 capitalize transition-colors duration-300 transform bg-white rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:ring focus:ring-gray-200 focus:ring-opacity-80"
                      >
                        Register Now
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 mt-6 xl:mt-12 xl:gap-12 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-full w-5/12 p-8 space-y-8 text-center bg-green-600 rounded-lg mt-5 mx-auto mb-5">
                  <p className="font-medium text-gray-200 uppercase">
                    {userPayment[0].pricing_name}
                  </p>
                  <p className="font-medium text-xl text-gray-200">
                    Duration: {daysLeft} {"days"}
                  </p>
                  <p className="max-w-2xl mx-auto mt-4 text-center text-dryGray xl:mt-6 dark:text-gray-300">
                    Wishing you a great movie-watching experience at NetMovie
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <h1 className="text-2xl font-semibold text-center text-subMain capitalize lg:text-3xl mt-52 mb-52">
            Not Found
          </h1>
        )}
      </div>
    </Layout>
  );
}

export default Package;
