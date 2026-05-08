import { Link } from "react-router-dom";
import { FaLayerGroup } from "react-icons/fa";

export default function CreateGroup({ path }) {
  return (
    <Link to={path}>
      <button
        type="button"
        className="w-8 h-8 justify-center bg-blue-500 text-white rounded flex items-center gap-2"
      >
        <FaLayerGroup />
      </button>
    </Link>
  );
}
