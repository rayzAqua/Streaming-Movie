import React, { useContext, useState } from "react";
import { BsArrowLeftShort, BsFillTagsFill } from "react-icons/bs";
import { BiSolidUser } from "react-icons/bi";
import { AiFillDashboard } from "react-icons/ai";
import { TbReportMoney } from "react-icons/tb";
import { GiWallet } from "react-icons/gi";
import { RiUserStarFill } from "react-icons/ri";
import { ImFilm, ImProfile } from "react-icons/im";
import { FaPowerOff } from "react-icons/fa";
import { Link, NavLink } from "react-router-dom";
import AuthContext from "../../context/AuthProvider";
function SideBarAdmin() {
  const { logout } = useContext(AuthContext);

  const [open, setOpen] = useState(true);

  const SideLinks = [
    {
      name: "Dash Board",
      link: "/dashboard",
      mt: true,
      icon: AiFillDashboard,
    },
    {
      name: "Customers",
      link: "/",
      mt: true,
      icon: BiSolidUser,
    },
    {
      name: "Genres",
      link: "/genre",
      mt: true,
      icon: BsFillTagsFill,
    },
    {
      name: "Movies",
      link: "/manage-movie",
      icon: ImFilm,
    },
    {
      name: "Actors",
      link: "/actor",
      icon: RiUserStarFill,
    },
    {
      name: "Pricing",
      link: "/pricing",
      mt: true,
      icon: TbReportMoney,
    },
    {
      name: "Payment",
      link: "/payment",
      icon: GiWallet,
    },
    // {
    //     name:"Profile",
    //     link:"/admin-profile",
    //     mt:true,
    //     icon:ImProfile
    // },
  ];
  return (
    <div
      className={`bg-dry h-screen p-5 pt-8 relative duration-300 ${
        open ? "w-72" : "w-20"
      }`}
    >
      <BsArrowLeftShort
        className={`bg-white text-dry text-3xl rounded-full absolute -right-3 top-9 border border-dry cursor-pointer z-50 ${
          !open && "rotate-180"
        }`}
        onClick={() => setOpen(!open)}
      />
      <div className="inline-flex">
        <img className={`w-10 object-cover`} src="/favicon.png" alt="logo" />
        <h1
          className={`text-white px-3 py-4 origin-left font-medium text-2xl duration-300 ${
            !open && "scale-0"
          }`}
        >
          NetMovie
        </h1>
      </div>
      <ul>
        {SideLinks.map((menu, index) => (
          <>
            <li>
              <NavLink
                key={index}
                to={menu.link}
                style={({ isActive, isPending }) => {
                  return {
                    background: isActive ? "#E0D5D5" : "",
                    color: isActive ? "#F20000" : "",
                  };
                }}
                className={`text-gray-300 text-sm flex items-center gap-x-4 cursor-pointer p-2 hover:text-subMain hover:bg-main rounded-md ${
                  menu.mt ? "mt-8" : "mt-2"
                }`}
              >
                <span className="text-2xl block float-left">
                  <menu.icon />
                </span>
                <span
                  className={`text-base font-medium flex-1 duration-200 ${
                    !open && "hidden"
                  }`}
                >
                  {menu.name}
                </span>
              </NavLink>
            </li>
          </>
        ))}
        <>
          <li>
            <div
              className={`text-gray-300 text-sm flex items-center gap-x-4 cursor-pointer p-2 hover:text-subMain hover:bg-main rounded-md mt-8`}
              onClick={logout}
            >
              <span className="text-2xl block float-left">
                <FaPowerOff />
              </span>
              <span
                className={`text-base font-medium flex-1 duration-200 ${
                  !open && "hidden"
                }`}
              >
                Logout
              </span>
            </div>
          </li>
        </>
      </ul>
    </div>
  );
}

export default SideBarAdmin;
