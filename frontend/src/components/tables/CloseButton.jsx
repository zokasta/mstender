import { IoClose } from "react-icons/io5";

export default function CloseButton({onClick=()=>{}}) {
  return (
    <button
    type="button"
    onClick={onClick}
    className="w-8 h-8 justify-center bg-gray-400 text-white rounded flex items-center gap-2"
    >
      <IoClose/>
    </button>
  );
}
