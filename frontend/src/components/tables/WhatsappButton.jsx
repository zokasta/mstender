import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
export default function WhatsappButton({ phone }) {
  return (
    <Link to={`https://wa.me/+91${phone}`}>
      <button
        type="button"
        className="w-8 h-8 justify-center bg-green-500 text-white rounded flex items-center gap-1"
      >
        <FaWhatsapp className="scale-110"/>
      </button>
    </Link>
  );
}
