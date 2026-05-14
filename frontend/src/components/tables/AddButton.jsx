import { Link } from "react-router-dom";

import { Plus } from "lucide-react";

export default function AddButton({ path="", title="", onClick = () => {} }) {
  return (
    <Link to={path}>
      <button
        onClick={() => onClick(true)}
        className="h-12 px-5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20 transition-all flex items-center gap-3 font-semibold"
      >
        <Plus size={17} />

        <span className="text-sm">{title}</span>
      </button>
    </Link>
  );
}
