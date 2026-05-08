import { FaEye } from "react-icons/fa";

import { Link } from "react-router-dom";

export default function DetailsButton({ path }) {
  return (
    <Link to={path}>
      <button
        type="button"
        className="w-8 h-8 justify-center bg-green-500 text-white rounded flex items-center gap-2"
      >
        <FaEye />
      </button>
    </Link>
  );
}
