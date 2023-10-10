import React from 'react'
import { Link } from 'react-router-dom';

function Footer() {
  const Links = [
    {
      title:'Company',
      links:[
        {
          name:'Home',
          link:'/'
        },
        {
          name:'About',
          link:'/about'
        },
        {
          name:'Contact',
          link:'/contact'
        },
        {
          name:'Movies',
          link:'/movies'
        },
        {
          name:'Series',
          link:'/series'
        },
      ]
    },
    {
      title:'Top Genres',
      links:[
        {
          name:'Action',
          link:'#'
        },
        {
          name:'Romantic',
          link:'#'
        },
        {
          name:'Drama',
          link:'#'
        },
        {
          name:'Comedy',
          link:'#'
        },
        {
          name:'Horror',
          link:'#'
        },
      ]
    },
    {
      title:'Account',
      links:[
        {
          name:'Profile',
          link:'/profile'
        },
        {
          name:'Favorite',
          link:'/favorite'
        },
        {
          name:'Change Password',
          link:'/change-password'
        }, 
      ]
    }
  ]
  return (
    <div className='bg-dry py-4 bprder=t-2 border-black'>
      <div className='container mx-auto px-2'>
        <div className='grid grid-cols-2 md:grid-cols-7 xl:grid-cols-10 xl:justify-items-end gap-5 sm:gap-9 lg:gap-11 xl:gap-7 py-10 justify-between'>
          {
            Links.map((link,index)=>(
              <div key = {index} className='col-span-1 md:col-span-2 lg:col-span- pb-3.5 sm:pb-0'>
                <h3 className='text-md lg:leading-7 font-medium mb-4 sm:mb-5 lg:mb-6 pb-0.5'>{link.title}</h3>
                <ul className='text-sm flex flex-col space-y-3'>
                  {
                    link.links.map((text,index)=>(
                      <li key={index} className='flex items-baseline'>
                        <Link to={text.link} className='text-border inline-block w-full hover:text-subMain'>{text.name}</Link>
                      </li>
                    ))
                  }
                </ul>
              </div>
            ))
          }
          <div className='pb-3.5 sm:pb-0 col-span-1 md:col-span-2 lg:col-span-3'>
          <Link to="/">
            <img src='/image/logo.png' alt='logo' className='w-2/4 object-contain h-12'/>
          </Link>
          <p className='leading-7 text-sm text-border mt-3'>
            <span>
              97 Man Thien, Hiep Phu,  <br/> Thu Duc city, HCM city
            </span>
            <br/>
            <span>
              Tell: +84 929 434 529
              <br/>
              Email: hoangha0612.work@gmail.com
            </span>
          </p>
        </div>
        </div>
      </div>
    </div>
  )
}

export default Footer