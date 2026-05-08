import { useState } from "react";
import * as XLSX from "xlsx";
export default function Export({ data = "" }) {
  const [expo, setExpo] = useState(false);

  const exportToExcel = (jsonData, fileName = "data.xlsx") => {
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, fileName);
  };
  return (
    <button
      onClick={() => {
        setExpo(!expo);
      }}
      className="w-20 h-7 my-[18px] rounded-md border-[1px] border-gray-400 relative shadow-md outline-none focus-visible:ring-2 ring-orange-500 ring-offset-2 ml-3"
    >
      Export
      <div
        className={`${
          expo
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-75 pointer-events-none"
        } translate-y-2 absolute w-20 h-40 bg-white rounded-md shadow-md border-[1px] border-gray-400 duration-200`}
      >
        <div
          className="h-6 hover:bg-orange-500 hover:text-white border-b-[1px] rounded-t-md border-gray-300 text-gray-800"
          onClick={() => exportToExcel(data, "file.xlsx")}
        >
          Excel
        </div>
      </div>
    </button>
  );
}
