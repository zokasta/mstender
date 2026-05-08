import { FaFilter } from "react-icons/fa";

export default function FilterButton({onClick}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-primary-50"
    >
      <FaFilter /> Filter
    </button>
  );
}
