import { useState, Fragment } from "react";
import { addNotification } from "../../components/notifications/Notification";
import { IconButton, Tooltip } from "@mui/material";

import Token from "../../database/Token";
import Edit from "../../assets/SVG/Edit";

export default function EditPopup({
  title = "Enter Title",
  route,
  onLoading = () => {},
  format = [
    { title: "name", target: "name", type: "text" },
    { title: "password", target: "password", type: "password" },
  ],
  data = [{ name: "User", password: "password" }],
  alert = "row has been updated",
}) {
  const [active, setActive] = useState(false);
  const [formValue, setFormValue] = useState(data);

  const EditFunction = async () => {
    try {
      console.log(formValue);
      const response = await Token.patch(route, formValue);
      console.log("Response:", response);
      if (response.data.status) {
        addNotification("Successful booking", "message", "success");
        setActive(false);
      } else {
        addNotification("Error", response.data.message, "danger");
        console.log("Error message from server:", response.data.message);
      }
    } catch (e) {
      console.error("Error during API call:", e);
      addNotification("Error", e.message, "danger");
    } finally {
      onLoading();
    }
  };

  return (
    <Fragment>
      <Tooltip arrow placement="top" title="Edit">
        <IconButton className="w-min" onClick={() => setActive(true)}>
          <Edit />
        </IconButton>
      </Tooltip>

      <div
        className={`z-[5] w-screen h-screen overflow-y-auto  fixed inset-0 flex items-center justify-center pt-10 ${
          active ? "visible" : "invisible"
        } bg-black/50`}
      >
        <div
          className={`bg-white dark:bg-surface-darkCard max-w[400px] w-[400px] rounded-md shadow-2xl transition-all p-3 ${
            active ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <h1 className="text-5xl font-bold text-primary-500 text-center ">
            {title}
          </h1>
          {format.map((list, index) => (
            <div key={index}>
              <p className="font-bold">{list.title}</p>
              <input
                type="text"
                className="w-full h-10 bg-surface-light dark:bg-surface-dark border-[2px] border-gray-300 rounded-sm outline-none focus:border-primary-500 px-2 focus:border-[2px] mb-2"
                value={formValue[list.target]}
                onChange={(e) =>
                  setFormValue((prev) => ({
                    ...prev,
                    [list.target]: e.target.value,
                  }))
                }
              />
            </div>
          ))}

          <button
            className="outline-none my-[3px] w-full h-10 bg-primary-500 hover:bg-primary-600 focus-visible:ring-2 ring-offset-2 ring-red-500 text-white text-xl rounded-md shadow-md"
            onClick={EditFunction}
          >
            Edit
          </button>
          <button
            className="w-full h-10 rounded-sm my-2 text-lg bg-white dark:bg-surface-darkCard border-[1.5px] border-dashed border-gray-400 text-gray-500 dark:text-gray-400 shadow-md outline-none hover:bg-primary-50 focus:bg-primary-50"
            onClick={() => setActive(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </Fragment>
  );
}
