import { Link } from "react-router-dom";
import { BsFillPencilFill } from "react-icons/bs";

export default function EditButton({ path }) {
  return (
    <Link to={path}>
      <button
        type="button"
        className="w-8 h-8 justify-center bg-primary-500 text-white rounded flex items-center gap-2"
      >
        <BsFillPencilFill />
      </button>
    </Link>
  );
}
