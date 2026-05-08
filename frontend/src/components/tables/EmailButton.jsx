import { FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function EmailButton({ email }) {
  return (
    <Link to={`mailto:${email}`}>
      <button
        type="button"
        className="w-8 h-8 justify-center bg-blue-500 text-white rounded flex items-center gap-2"
      >
        <FaEnvelope />
      </button>
    </Link>
  );
}
