import { FaPhone } from "react-icons/fa";
import { Link } from "react-router-dom";
export default function CallButton({ phone }) {
  return (
    <Link to={`tel:${phone}`}>
      <button
        type="button"
        className="w-8 h-8 justify-center bg-green-500 text-white rounded flex items-center gap-2"
      >
        <FaPhone className="rotate-90" />
      </button>
    </Link>
  );
}
