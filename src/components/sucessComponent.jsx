import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SuccessToast = ({ message }) => {
  // Display success toast
  const showSuccessToast = () => {
    toast.success(message, {
      position: "top-right",
      autoClose: 2000, // Close the toast after 2 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (      
    <div className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50">
      <div className="max-w-sm w-full bg-green-100 shadow-lg rounded-lg pointer-events-auto">
        <div className="rounded-lg shadow-xs overflow-hidden">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm leading-5 font-medium text-green-800">{message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ToastContainer to display toasts */}
      <ToastContainer />
      {/* Display success toast when component mounts */}
      {showSuccessToast()}
    </div>
  );
};

export default SuccessToast;
