import axios from "axios";
import { useState, useRef } from "react";
import ErrorToast from "../components/errorComponent";
import SuccessToast from "../components/successComponent";

export default function ForgotPasswordPage() {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const emailRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Reset Password Button Pressed");

    // Get form data
    const email = emailRef.current.value;

    if (!email) {
      setErrorMessage("Email is required.");
      return;
    }

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Invalid email address.");
      return;
    }

    try {
      // Attempt to request password reset
      const response = await axios.post("http://localhost:4000/ForgetPassword/user", { email });

      console.log(response.data);
      setSuccessMessage("Password reset link sent to your email!");
      setErrorMessage("");
    } catch (error) {
      const errorResponse =
        error.response?.data?.message || "An error occurred during the password reset request.";
      console.error(errorResponse);
      setErrorMessage(errorResponse);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-10 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Forgot Password
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit} method="POST">
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Reset Password
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Remember your password?{' '}
          <a href="/signin" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Sign in
          </a>
        </p>
      </div>
      {errorMessage && <ErrorToast message={errorMessage} />}
      {successMessage && <SuccessToast message={successMessage} />}
    </div>
  );
}
