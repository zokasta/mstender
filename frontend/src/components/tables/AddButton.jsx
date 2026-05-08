import { Link } from "react-router-dom";

import { FaPlus } from "react-icons/fa";

export default function AddButton({ path, title }) {
  return (
    <Link to={path}>
      <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-md shadow-sm hover:bg-primary-600 transition">
        <FaPlus />
        {title}
      </button>
    </Link>
  );
}
