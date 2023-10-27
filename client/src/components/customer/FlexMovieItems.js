import React from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { BiTime } from "react-icons/bi";

function FlexMovieItems({ movie }) {
  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{movie.genre.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <FaRegCalendarAlt className="text-subMain w-3 h-3" />
        <span className="text-sm font-medium">{movie.production_year}</span>
      </div>
      <div className="flex items-center gap-2">
        <BiTime className="text-subMain w-3 h-3" />
        <span className="text-sm font-medium">{movie.length} minutes</span>
      </div>
    </>
  );
}

export default FlexMovieItems;
