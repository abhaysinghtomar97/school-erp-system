import React, { useState } from "react";
import { X } from "lucide-react";

const AlertPopup = ({ msg }) => {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div
      className="
        fixed 
        top-4 left-1/2 -translate-x-1/2
        z-[9999]
        w-[95%] sm:w-auto
        flex justify-center
        px-2
      "
    >
      <div
        className="
          relative
          flex items-start gap-3
          bg-red-100
          border border-red-300
          text-red-900
          shadow-lg
          rounded-md
          px-4 py-3
          w-full sm:max-w-xl
          animate-in fade-in slide-in-from-top-2 duration-300
        "
      >
        {/* Message */}
        <p
          className="
            text-sm sm:text-[15px]
            leading-5
            pr-6
            break-words
          "
        >
          {msg}
        </p>

        {/* Close Button */}
        <button
          onClick={() => setShow(false)}
          className="
            absolute top-3 right-3
            text-red-700
            hover:text-red-900
            transition
            cursor-pointer
          "
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default AlertPopup;