import { createContext, useContext, useEffect, useState } from "react";

const RentMovieContext = createContext();

const RentMovieProvider = ({ children }) => {
  const initialRentData = {
    package_name: null,
    total: null,
    order_id: null,
    customer: null,
    email: null,
    hasData: false,
    movie_title: null,
  };

  const [rentData, setRentData] = useState(() => {
    // Khởi tạo rentData từ localStorage nếu có
    const storedRentData = localStorage.getItem("rentData");
    console.log(storedRentData);
    return storedRentData ? JSON.parse(storedRentData) : initialRentData;
  });

  useEffect(() => {
    if (
      !rentData.package_name &&
      !rentData.total &&
      !rentData.order_id &&
      !rentData.customer &&
      !rentData.email &&
      !rentData.movie_title
    ) {
      const storedRentData = localStorage.getItem("rentData");
      if (storedRentData) {
        setRentData(JSON.parse(storedRentData));
        console.log("Đã khôi phục rentData từ localStorage");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("rentData", JSON.stringify(rentData));
  }, [rentData]);

  return (
    <RentMovieContext.Provider value={[rentData, setRentData]}>
      {children}
    </RentMovieContext.Provider>
  );
};

const useRentMovieContext = () => useContext(RentMovieContext);

export { useRentMovieContext, RentMovieProvider };
