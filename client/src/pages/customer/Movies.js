import React, {Fragment ,useState } from 'react'
import Layout from '../../layout/Layout'
import MovieCard from '../../components/customer/MovieCard';
import { CgSpinner } from 'react-icons/cg';
import axios from '../../api/axios';
import { useLocation, useParams } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../../context/AuthProvider';
import { useEffect } from 'react';
import axiosApiInstance from '../../context/intercepter';
import { CategoriesData } from './../../Data/CategoriesData';
import { Listbox, Transition } from '@headlessui/react';
import { CgSelect } from 'react-icons/cg';
import { FaCheck } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';

function MoviesPage() {
  const { id } = useParams();
  const param = useLocation();
  const [load,setLoad] = useState(false);
  const [loadFavorite,setLoadFavorite] = useState(false);

  const {user}= useContext(AuthContext);
  const [favoriteFilm, setFavoriteFilm] = useState([]);
  const [activeFilm, setActiveFilm] = useState([]);
  
  const RatesData = [
    {title:"Sort By Rates",value:0},
    {title:"1 Star and higher",value:1},
    {title:"2 Star and higher",value:2},
    {title:"3 Star and higher",value:3},
    {title:"4 Star and higher",value:4},
    {title:"5 Star",value:5},
  ]

  const [genres,setGenres] = useState({title:"Genres",value:0});
  const [rates,setRate] = useState(RatesData[0]);
  const [searchFilter, setSearchFilter] = useState('');

  const handleSearchFilter = (e) => {
    console.log(searchFilter)
    console.log(genres.value)
    console.log(rates.value)
  };

  const Filter = [
    {
      value:genres,
      onchange:setGenres,
      items:CategoriesData
    },
    {
      value:rates,
      onchange:setRate,
      items:RatesData
    }
  ]

  async function getFavoriteId(){
    try {
      const response = await axiosApiInstance.get(axiosApiInstance.defaults.baseURL + `/films/getFavoriteFilms`);
      const favoriteIds = response.data.map(film => film.id);
      setFavoriteFilm(favoriteIds);
    } catch (error) {
      setFavoriteFilm([]);
    }
    setLoadFavorite(true);
  }

  async function getActiveFilm() {
    try {
      const query = id? `?search=${id}` : "";
      const result = await axios.get(axios.defaults.baseURL + `/films/search${query}`);
      setActiveFilm(result?.data);
      setLoad(true);
    } catch (error) {
      console.log(error);
    }
  }

  const handleFilter = async () => {
    var query ='';
    if(searchFilter!=''){
      query += `search=${searchFilter}`;
    }
    if (genres.value !== 0) {
      if(searchFilter!='') query += `&genres=${genres.value}`;
      else query += `genres=${genres.value}`;
    }
    if (rates.value !== 0) {
      if(searchFilter!=''||genres.value !== 0)
        query += `&rates=${rates.value}`;
      else query += `rates=${rates.value}`;
    }
    console.log(query)

    try {
      const result = await axios.get(axios.defaults.baseURL + `/films/search?${query}`);
      setActiveFilm(result?.data);
      setLoad(true); // Cập nhật trạng thái để cập nhật giao diện
    } catch (error) {
      console.log(error);
    }
  };


  const maxpage=10;
  const [page,setPage] = useState(maxpage);
  const HandleLoadingMore = ()=>{
    setPage (page + maxpage)
  };

  useEffect(() => {
    getActiveFilm();
  }, [param,load]);
  useEffect(() => {
    if (user != null) {
      getFavoriteId();
    }
  }, [param,loadFavorite]);

  return (
    <Layout>
      <div className='min-h-screen container mx-auto px-2 my-6'>

      <div className='my-6 bg-dry border text-dryGray border-gray-800 grid md:grid-cols-2 grid-cols-2 lg:gap-12 gap-2 rounded p-6'>
        <div className="col-span-2">
              <div className="w-full lg:w-96 text-sm bg-dryGray rounded-full flex-btn gap-4">
                <input
                  type="text"
                  placeholder="Search Movie Name from here"
                  className="font-medium placeholder:text-border text-sm w-11/12 h-12 bg-transparent border-none px-2 text-black"
                  onChange={(e)=>setSearchFilter(e.target.value)}
                />
                <button
                  type="button"
                  className="bg-subMain w-20 flex-colo h-12 rounded-full text-white border border-subMain hover:bg-dryGray hover:text-subMain"
                  onClick={handleFilter}
                  >
                  <FaSearch />
                </button>
              </div>
            </div>
          {
            Filter.map((item,index)=>(
              <Listbox key={index} value={item.value} onChange={item.onchange}>
                <div className='relative'>
                  <Listbox.Button className='relative border border-gray-800 w-full text-white bg-main rounded-lg cursor-default py-4 pl-6 pr-10 text-left text-xs'>
                    <span className='block truncate'>{item.value.title}</span>
                    <span className='absolute inset-y-0 right-0 flex items-center pointer-events-none pr-2'>
                      <CgSelect className="h-5 w-5" aria-hidden="true"/>
                    </span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-dry border border-gray-800 text-dryGray rounded-md shadow-lg max-h-60 py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {
                        item.items.map((iterm,i)=>(
                          <Listbox.Option key={i} className={({active}) => `relative cursor-default select-none py-2 pl-10 pr-4 text-white ${active? "bg-subMain":""}`} value={iterm}>
                            {({selected})=>(
                              <>
                                <span className={`block truncate ${selected? 'font-semibold':'font-normal'}`}>
                                  {iterm.title}
                                </span>
                                {
                                  selected?(
                                    <span className='absolute right-2 inset-y-0 flex items-center pl-3'>
                                      <FaCheck className="w-4 h-4" aria-hidden="true"/>
                                    </span>
                                  ):null
                                }
                              </>
                            )}
                          </Listbox.Option>
                        ))
                      }
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            ))
          }
        </div>

        <p className='text-lg font-medium my-6'>
          Total <span className='font-bold text-subMain'>{activeFilm?.length}</span>{' '} items Found
        </p>
        <div className='grid sm:mt-10 mt-6 xl:grid-cols-4 2xl:grid-cols-5 lg:grid-cols-3 sm:grid-cols-2 gap-6'>
          {
            activeFilm.map((movie,index)=>(
              <MovieCard 
                key={index} 
                movie={movie} 
                favoriteFilm={favoriteFilm}
                setFavoriteFilm={setFavoriteFilm}
                user={user}/>
            ))
          }
        </div>
        {/*Loading More*/}
        <div className='w-full flex-colo md:my-20 my-10'>
          <button onClick={HandleLoadingMore} className='flex-rows gap-3 text-white py-3 px-8 rounded font-semibold border-2 border-subMain'>
            Loading More <CgSpinner className='animate-spin'/>
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default MoviesPage