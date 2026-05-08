import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";

export default function SeeInvoiceButton({ path }) {
  return (
    <Link to={path}>
      <button
        type="button"
        className="w-8 h-8 justify-center bg-blue-600 text-white rounded flex items-center gap-2"
      >
        <FaEye />
        {/* <BsFillPencilFill/> */}
      </button>
    </Link>
  );
}
