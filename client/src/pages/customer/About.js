import React from 'react'
import Layout from '../../layout/Layout'
import Head from '../../components/customer/Head'

function About() {
  return (
    <Layout>
      <div className='min-h-screen container mx-auto px-2 my-6'>
        <Head title="About Us"/>
        <div className='xl:py-20 py-10 px-4'>
          <div className='grid grid-flow-row xl:grid-cols-2 gap-4 xl:gap-16 items-center'>
            <div>
              <h3 className='text-xl lg:text-3xl mb-4 font-semibold'>
                Welcome to our NetMovie
              </h3>
              <div className='mt-3 text-sm leading-8 text-text'>
                <p>NetMovie is an online movie watching service developed by PTIT student.
                  With the criterion of "Unlimited", NetMovie offers Users diverse service packages,
                  on multi-platforms and multi-infrastructure. Through the website, Users can enjoy
                  the unique content store, leading multinational movie titles and the latest trending
                  entertainment programs. As one of the leading brands in the television service market,
                  NetMovie makes a difference not only by the quality of its content but also by pioneering
                  breakthroughs in interactive television technology, helping users from Enjoy becoming an
                  active factor, bringing many new and unlimited experiences throughout the process of
                  enjoying with NetMovie.</p>
              </div>
              <div className='grid md:grid-cols-2 gap-6 mt-8'>
                <div className='p-8 bg-dry rounded-lg'>
                  <span className='text-3xl block font-extrabold mt-4'>
                    10K
                  </span>
                  <h4 className='text-lg font-semibold mb-2'>Movies</h4>
                  <p className='mb-0 text-text leading-7 text-sm'>
                    For watching in NetMovie
                  </p>
                </div>
                <div className='p-8 bg-dry rounded-lg'>
                  <span className='text-3xl block font-extrabold mt-4'>
                    8K
                  </span>
                  <h4 className='text-lg font-semibold mb-2'>Users</h4>
                  <p className='mb-0 text-text leading-7 text-sm'>
                    Completely free, without registration!
                  </p>
                </div>
              </div>
            </div>
            <div className='mt-10 lg:mt-0'>
              <img
                src='/image/about2.jpg'
                alt='aboutus'
                className='w-full xl:block hidden h-header rounded-lg object-cover'/>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default About