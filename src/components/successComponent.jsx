import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SuccessToast = ({ message }) => {
  useEffect(() => {
    if (message) {
      toast.success(message, {
        position: "top-right", // Position of the toast
        autoClose: 2000, // Auto close the toast after 2 seconds
        hideProgressBar: false, // Display or hide the progress bar
        closeOnClick: true, // Close the toast when clicked
        pauseOnHover: true, // Pause the autoClose timer when hovered
        draggable: true, // Make the toast draggable
        style: {
          background: "#5cb85c", // Background color (green shade for success)
          color: "white", // Text color
          fontSize: "16px", // Font size
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)", // Box shadow
          borderRadius: "8px", // Border radius
          padding: "16px", // Padding
        },
        progress: true, // Disable or configure the progress bar
      });
    }
  }, [message]);

  return <ToastContainer />;
};

export default SuccessToast;
