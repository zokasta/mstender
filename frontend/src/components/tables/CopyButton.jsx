import { FaCopy } from "react-icons/fa6";

import { Link } from "react-router-dom";

export default function CopyButton({ path }) {
  return (
    <Link to={path}>
      <button
        type="button"
        className="w-8 h-8 justify-center bg-yellow-400 text-white rounded flex items-center gap-2"
      >
        <FaCopy className="" />
        {/* <FaTrash /> */}
      </button>
    </Link>
  );
}
