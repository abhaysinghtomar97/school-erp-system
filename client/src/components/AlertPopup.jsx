import React, { useState } from "react";
import { X } from "lucide-react";

const AlertPopup = (props) => {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="fixed top-25 right-2.5 -translate-x-1/2 z-50">
      <div className="flex items-start gap-3 bg-red-100 border border-red-200 text-red-900 px-5 py-4 rounded-md shadow-md max-w-md relative">
        
        {/* Message */}
        <p className="text-sm leading-5">
         {props.msg}
        </p>

        {/* Close Button */}
        <button
          onClick={() => setShow(false)}
          className="text-red-700 hover:text-red-900"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default AlertPopup;