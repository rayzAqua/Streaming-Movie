import React from "react";

export default function Pagination({
  itemsPerPage,
  totalItems,
  paginateFront,
  paginateBack,
  currentPage,
  lastPage
}) {
    const handleClick = (event) => {
        event.preventDefault();
      };
    const handleBack = (event)=>{
        paginateBack();
    }
    const handleNext = (event)=>{
        paginateFront();
    }

  return (
    <div className='py-2'>
      <nav className='block'></nav>
      <div>
        <nav
          className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
          aria-label='Pagination'
        >
          <a
            onClick={currentPage==1?handleClick:handleBack}
            href='#'
            className={`relative inline-flex ${currentPage==1?"text-gray-400":"text-dry"} items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50`}
          >
            <span>Previous</span>
          </a>

          <a
            onClick={currentPage==lastPage?handleClick:handleNext}
            href='#'
            className={`relative inline-flex ${currentPage==lastPage?"text-gray-400":"text-dry"} items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50`}
          >
            <span>Next</span>
          </a>
        </nav>
      </div>
    </div>
  );
}