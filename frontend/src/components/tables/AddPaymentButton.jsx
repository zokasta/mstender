import { FaListUl } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function AddPaymentButton({ path }) {

  return (
    <Link to={path}>
      <button
        type="button"
        className="w-8 h-8 justify-center bg-rose-500 text-white rounded flex items-center gap-2"
      >
        <FaListUl />
      </button>
    </Link>
  );
}
