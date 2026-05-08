import { useState } from "react";

export default function SelectOption(props) {
  const [active, setActive] = useState(false);
  const [value,setValue]= useState(5);
  
  return (
     <div className="relative w-20 min-w-20 m-5 float-right rounded-md border-[1px] border-gray-500 shadow-md z-[1]">
     <button
        onClick={() => setActive(!active)}
        className="w-full outline-none focus-visible:ring-2 ring-orange-500 ring-offset-2 rounded-md "
      >
        {value}
      </button>
      <div className={`translate-y-2 absolute duration-300 ${active?"opacity-100 scale-100 pointer-events-auto":"opacity-0 scale-75 pointer-events-none"}  rounded-md shadow-md  border-[1px] border-gray-300 `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-20 h-8 border-y-[1px] border-gray-300 hover:bg-orange-500 hover:text-white bg-white text-center flex items-center justify-center rounded-t-md" onClick={()=>{setActive(false);setValue("5"); props.update("5")}}>5</div>
        <div className="w-20 h-8 border-y-[1px] border-gray-300 hover:bg-orange-500 hover:text-white bg-white text-center flex items-center justify-center" onClick={()=>{setActive(false);setValue("10"); props.update("10")}}>10</div>
        <div className="w-20 h-8 border-y-[1px] border-gray-300 hover:bg-orange-500 hover:text-white bg-white text-center flex items-center justify-center" onClick={()=>{setActive(false);setValue("25"); props.update("25")}}>25</div>
        <div className="w-20 h-8 border-y-[1px] border-gray-300 hover:bg-orange-500 hover:text-white bg-white text-center flex items-center justify-center" onClick={()=>{setActive(false);setValue("50"); props.update("50")}}>50</div>
        <div className="w-20 h-8 border-y-[1px] border-gray-300 hover:bg-orange-500 hover:text-white bg-white text-center flex items-center justify-center" onClick={()=>{setActive(false);setValue("100"); props.update("100")}}>100</div>
        <div className="w-20 h-8 border-y-[1px] border-gray-300 hover:bg-orange-500 hover:text-white bg-white text-center flex items-center justify-center" onClick={()=>{setActive(false);setValue("250"); props.update("250")}}>250</div>
        <div className="w-20 h-8 border-y-[1px] border-gray-300 hover:bg-orange-500 hover:text-white bg-white text-center flex items-center justify-center rounded-b-md" onClick={()=>{setActive(false);setValue("500"); props.update("500")}}>500</div>
      </div>
     </div>
  );
}
