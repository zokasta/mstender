import React, { useEffect, useMemo, useRef, useState } from "react";
function useClickOutside(ref, handler) {
    useEffect(() => {
      const listener = (e) => {
        if (!ref.current || ref.current.contains(e.target)) return;
        handler(e);
      };
      window.addEventListener("mousedown", listener);
      window.addEventListener("touchstart", listener);
      return () => {
        window.removeEventListener("mousedown", listener);
        window.removeEventListener("touchstart", listener);
      };
    }, [ref, handler]);
  }
  


export default function Dropdown({ children, button, align = "right" }) {
    const ref = useRef();
    const [open, setOpen] = useState(false);
    useClickOutside(ref, () => setOpen(false));
    return (
      <div className="relative inline-block" ref={ref}>
        <button onClick={() => setOpen((s) => !s)}>{button}</button>
        {open && (
          <div
            className={`absolute mt-2 w-48 bg-white border rounded shadow-md z-40 ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {children({ close: () => setOpen(false) })}
          </div>
        )}
      </div>
    );
  }
  