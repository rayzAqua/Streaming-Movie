import React from "react";
import { Link, NavLink } from "react-router-dom";
import { FaSearch, FaHeart, FaAngleDown } from "react-icons/fa";
import { CgUser } from "react-icons/cg";
import { GiWallet } from "react-icons/gi";
import { useContext, useState } from "react";
import AuthContext from "../../context/AuthProvider";

function NavBar() {
  const { logout } = useContext(AuthContext);
  const hover = "hover:text-subMain transitions text-white";
  const Hover = ({ isActive }) => (isActive ? "text-subMain" : hover);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleOpen = () => {
    setOpen(!open);
  };

  const handleSearch = (e) => {
    console.log(search);
    if(search) window.location.href = `/movies/${search}`;
  };

  return (
    <>
      <div className="bg-main shadow-md sticky top-0 z-20">
        <div className="container mx-auto py-6 px-2 lg:grid gap-10 grid-cols-7 justify-between items-center">
          {/*Logo*/}
          <div className="col-span-1 lg:block hidden">
            <Link to="/">
              <img
                src="/image/logo.png"
                alt="logo"
                className="w-full h-12 object-contain"
              />
            </Link>
          </div>

          {/*search bar*/}
          <div className="col-span-3">
            <div className="w-full lg:w-80 text-sm bg-dryGray rounded flex-btn gap-4">
              <button
                className="bg-subMain w-12 flex-colo h-12 rounded text-white"
                type="button"
                onClick={handleSearch}
              >
                <FaSearch />
              </button>
              <input
                type="text"
                placeholder="Search Movie Name from here"
                className="font-medium placeholder:text-border text-sm w-11/12 h-12 bg-transparent border-none px-2 text-black"
                onChange={(e)=> setSearch(e.target.value)}
              />
            </div>
          </div>

          {/*Menu*/}
          <div className="col-span-3 font-medium text-sm hidden xl:gap-14 2xl:gap-20 justify-between lg:flex xl:justify-end items-center mx-4">
            <NavLink to="/" className={Hover}>
              Home
            </NavLink>
            <NavLink to="/movies" className={Hover}>
              Movies
            </NavLink>
            <NavLink to="/about" className={Hover}>
              About
            </NavLink>
            <NavLink to="/contact" className={Hover}>
              Contact
            </NavLink>
            <NavLink to="/favorite" className={`${Hover} relative`}>
              <FaHeart className="w-6 h-6 hover:text-subMain" />
              <div className="w-5 h-5 flex-colo rounded-full text-xs bg-subMain text-white absolute -top-2 -right-3">
                5
              </div>
            </NavLink>
            <NavLink to="/package" className={`${Hover} relative`}>
              <GiWallet className="w-6 h-6 hover:text-subMain" />
            </NavLink>
            {JSON.parse(localStorage.getItem("tokens")) ? (
              <>
                <div className="relative">
                  <button onClick={handleOpen} className="flex flex-rows">
                    <CgUser className="w-8 h-8" />
                    <FaAngleDown />
                  </button>
                  {open ? (
                    <ul className="absolute right-0 border border-border bg-dry py-1 w-48">
                      <li className="p-1 border border-dry hover:border-white hover:text-subMain hover:font-semibold">
                        <a className="block p-3" href="/profile">
                          Profile
                        </a>
                      </li>
                      <li className="p-1 border border-dry hover:border-white hover:text-subMain hover:font-semibold">
                        <a className="block p-3" href="/password">
                          Change Password
                        </a>
                      </li>
                      <li className="p-1 border border-dry hover:border-white hover:text-subMain hover:font-semibold">
                        <button
                          className="w-full text-left p-3"
                          type="button"
                          onClick={() => logout()}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <div className="px-6 py-2 bg-subMain border hover:bg-dry hover:border-subMain">
                  <a href="/login">Login</a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default NavBar;
