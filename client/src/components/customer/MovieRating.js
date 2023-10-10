import React, { useEffect, useState } from 'react'
import Titles from './Title'
import { BsBookmarkStarFill } from 'react-icons/bs';
import { Select } from '../../pages/customer/UsedInput';
import Rating from './Star';
import { toast } from 'react-toastify';
import axiosApiInstance from '../../context/intercepter';
import { Link, useLocation } from 'react-router-dom';

function MovieRating({movie,setLoadRate,user}) {
    const param = useLocation();
    const [load, setLoad] = useState(false);

    const Ratings=[
        {
            title:"Vote for Film",
            value:0,
        },
        {
            title:"1 - Pair",
            value:1,
        },
        {
            title:"2 - Normal",
            value:2,
        },
        {
            title:"3 - Good",
            value:3,
        },
        {
            title:"4 - Excellent",
            value:4,
        },
        {
            title:"5 - Masterpiece",
            value:5,
        },
    ]

    const [rating,setRating] = useState(0);
    const [checkVote,setCheckVote] = useState();

    const handleVote = async () => {
        if(user){
          if (rating === 0) {
            toast.error("Please vote before submitting");
            return;
          }
        
          const payload = {
            vote: parseInt(rating),
          };
        
          const filmId = movie.id; // Assuming you have the movie ID available
        
          if (checkVote) {
            try {
              await axiosApiInstance.put(
                `${axiosApiInstance.defaults.baseURL}/films/editVote/${filmId}?vote=${payload.vote}`
              );
              toast.success("Edit Vote");
            } catch (error) {
              toast.error("Error editing vote");
              console.log(error);
            }
          } else {
            try {
              await axiosApiInstance.post(
                `${axiosApiInstance.defaults.baseURL}/films/addVote/${filmId}?vote=${payload.vote}`
              );
              setCheckVote(true);
              toast.success("Create Vote");
            } catch (error) {
              toast.error("Error creating vote");
              console.log(error);
            }
          }
          setLoadRate(false);
        }
      };
      

      async function getCheckVote() {
        const result = await axiosApiInstance.get(axiosApiInstance.defaults.baseURL + `/films/checkVote/${movie.id}`);
        setLoad(true);
        setCheckVote(result?.data.value);
    } 
     
      useEffect(() => {
        if(user) getCheckVote();

      }, [param,load]);

  return (
    <div className='my-12'>
        <Titles title="Reviews" Icon={BsBookmarkStarFill}/>
        <div className='mt-10 xl:grid flex-colo xl:grid-cols-2 grid-cols-5 gap-12 bg-dry xs:p-10 py-10 px-2 sm:p-20 rounded'>
            {/*Rate*/}
            <div className='xl:col-span-2 w-full flex flex-col gap-8'>
                <h3 className='text-xl text-text font-semibold'>
                    Rating for "{movie?.title}"
                </h3>
                <p className='text-sm leading-7 font-medium text-border'>
                    Your rating will help us rate the movie on this page.
                </p>
                <div className='text-sm w-full'>
                    <Select label="Select Rating" options={Ratings} onChange={(e) => setRating(e.target.value)}/>
                    <div className='flex mt-4 text-lg gap-2 text-star'>
                        <Rating value={rating}/>
                    </div>
                </div>
                {
                  user?
                  <button onClick={(e)=>handleVote()} className='bg-subMain text-white py-3 w-full flex-colo rounded'>Submit</button>
                  :
                  <Link to="/login" className='bg-subMain text-white py-3 w-full flex-colo rounded'>Submit</Link>

                }
            </div>
        </div>
    </div>
  )
}

export default MovieRating