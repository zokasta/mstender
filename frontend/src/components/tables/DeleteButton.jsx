import { FaTrash } from "react-icons/fa";

export default function DeleteButton({onClick=()=>{}}) {
  return (
    <button
    type="button"
    onClick={onClick}
    className="w-8 h-8 justify-center bg-red-600 text-white rounded flex items-center gap-2"
    >
      <FaTrash/>
    </button>
  );
}
