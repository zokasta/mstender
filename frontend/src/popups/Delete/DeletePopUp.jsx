import { useState, Fragment } from "react";
import { addNotification } from "../../components/notifications/Notification";
import { IconButton, Tooltip } from "@mui/material";
import Token from "../../database/Token";
import Delete from "../../assets/SVG/Delete";

export default function DeletePopup({
  route,
  id,
  title = "Are you sure you want to delete?",
  onLoading = () => {},
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteBooking = async () => {
    setLoading(true);
    try {
      const response = await Token.delete(`${route}${id}/`);
      if (response.data.status) {
        addNotification("Record deleted successfully", "Delete", "success");
        setOpen(false);
      } else {
        addNotification("Error", response.data.message, "danger");
      }
    } catch (e) {
      addNotification("Error", e.message, "danger");
    } finally {
      setLoading(false);
      onLoading();
    }
  };

  return (
    <Fragment>
      <Tooltip arrow placement="top" title="Delete">
        <IconButton onClick={() => setOpen(true)} className="w-min">
          <Delete />
        </IconButton>
      </Tooltip>

      {/* Fullscreen Overlay */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setOpen(false)}
      >
        {/* Modal */}
        <div
          className={`bg-white max-w-[400px] w-full rounded-md shadow-2xl p-5 transform transition-transform duration-200 ${
            open ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <h1 className="text-2xl font-bold text-red-500">Warning</h1>
          <p className="my-3 text-lg">{title}</p>

          <button
            className={`w-full h-10 rounded-md text-white text-lg font-semibold mb-2 ${
              loading ? "bg-red-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
            }`}
            onClick={deleteBooking}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>

          <button
            className="w-full h-10 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </Fragment>
  );
}
