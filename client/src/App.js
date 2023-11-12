import React from "react";
import Aos from "aos";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import Home from "./pages/customer/Home";
import About from "./pages/customer/About";
import Contact from "./pages/customer/Contact";
import MoviesPage from "./pages/customer/Movies";
import SingleMovie from "./pages/customer/SingleMovie";
import WatchPage from "./pages/customer/WatchPage";
import LoginPage from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Profile from "./pages/customer/Profile";
import ChangePass from "./pages/customer/Change-Pass";
import Favorite from "./pages/customer/Favorite";
import UserFogotPass from "./pages/UserFogotPass";
import UserChangePass from "./pages/UserChangePass";
import DashBoard from "./pages/admin/DashBoard";
import Genres from "./pages/admin/Genres";
import Customer from "./pages/admin/Customer";
import AdminMovies from "./pages/admin/AdminMovies";
import Actor from "./pages/admin/Actor";
import Pricing from "./pages/admin/Pricing";
import Payment from "./pages/admin/Payment";
import AdminProfile from "./pages/admin/AdminProfile";
import { AuthContextProvider } from "./context/AuthProvider";
import jwtDecode from "jwt-decode";
import Package from "./pages/customer/Package";
import { RentMovieProvider } from "./context/RentMovieProvider";
import Order from "./pages/customer/Order";

function App() {
  const tokens = JSON.parse(localStorage.getItem("tokens"));
  const permission = tokens ? jwtDecode(tokens.access_token).role : null;

  const ProtectedRoute = ({ children }) => {
    const { id } = useParams();
    const payment = JSON.parse(localStorage.getItem("payment"));

    if (!payment || !payment.some((item) => item.film_name === id)) {
      console.log("Not in payment");
      return <Navigate to={`/movie/${id}`} />;
    }

    return children;
  };

  Aos.init();
  return (
    <AuthContextProvider>
      <RentMovieProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {permission === "ADMIN" ? (
            <>
              <Route path="/dashboard" element={<DashBoard />} />
              <Route path="/" element={<Customer />} />
              <Route path="/manage-movie" element={<AdminMovies />} />
              <Route path="/genre" element={<Genres />} />
              <Route path="/actor" element={<Actor />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/admin-profile" element={<AdminProfile />} />
            </>
          ) : (
            <>
              <Route path="/profile" element={<Profile />} />
              <Route path="/password" element={<ChangePass />} />
              <Route path="/favorite" element={<Favorite />} />
              <Route
                path="/watch/:id"
                element={
                  <ProtectedRoute>
                    <WatchPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Home />} />
              <Route path="/package" element={<Package />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/movies/:id" element={<MoviesPage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/movie/:id" element={<SingleMovie />} />
              <Route path="/forgot-pass" element={<UserFogotPass />} />
              <Route path="/change-pass" element={<UserChangePass />} />
              <Route path="/payment" element={<Order />} />
            </>
          )}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </RentMovieProvider>
    </AuthContextProvider>
  );
}

export default App;
