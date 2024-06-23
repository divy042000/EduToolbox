import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ErrorToast = ({ message }) => {
  useEffect(() => {
    if (message) {
      toast.error(message, {
        position: "top-right",
        autoClose: 2000, // Close the toast after 2 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "white", // Gradient background color
          // Text color
          fontSize: "16px", // Font size
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)", // Box shadow
          borderRadius: "8px", // Border radius
          padding: "16px",
          borderColor: "black", // Padding
        },
        progress: undefined,
      });
    }
  }, [message]);

  return <ToastContainer />;
};

export default ErrorToast;
