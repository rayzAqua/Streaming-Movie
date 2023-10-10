import React, {Fragment,useState} from 'react'
import { CategoriesData } from './../../Data/CategoriesData';
import { Listbox, Transition } from '@headlessui/react';
import { CgSelect } from 'react-icons/cg';
import { FaCheck } from 'react-icons/fa';


const YearData = [
  {title:"Sort By Year"},
  {title:"1700-1800"},
  {title:"1800-1900"},
  {title:"1900-2000"},
  {title:"2000-2010"},
  {title:"2010-2030"},
]

const RatesData = [
  {title:"Sort By Rates"},
  {title:"1 Star"},
  {title:"2 Star"},
  {title:"3 Star"},
  {title:"4 Star"},
  {title:"5 Star"},
]

function Filter() {
  const [genres,setGenres] = useState({title:"Genres"});
  const [year,setYear] = useState(YearData[0]);
  const [rates,setRate] = useState(RatesData[0]);
  
  const Filter = [
    {
      value:genres,
      onchange:setGenres,
      items:CategoriesData
    },
    {
      value:year,
      onchange:setYear,
      items:YearData
    },
    {
      value:rates,
      onchange:setRate,
      items:RatesData
    }
  ]
  return (
    <div className='my-6 bg-dry border text-dryGray border-gray-800 grid md:grid-cols-3 grid-cols-2 lg:gap-12 gap-2 rounded p-6'>
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
  )
}

export default Filter