"use client";

import { useState } from "react";
import { LoginDTO, ErrorResponse, ValidationErrors } from "@/dto/auth";
import authService from "@/services/auth.service";
import Swal from "sweetalert2";

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginDTO>({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    try {
      await authService.login(formData);

      setIsLoading(false);

      Swal.fire({
        icon:'success',
        title: 'Login Successful',
        text: 'Redirecting To Chat Page'
      });
      //redirect to chat page if successful
      window.location.href = "/chat";
    } catch (err: unknown) {
      const errData = err as ErrorResponse;
      if (errData.errors) {
        setErrors(errData.errors);
      }

      // Optional: show a main message
      if (errData.message) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: errData.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="wrapper w-full flex items-center justify-center min-h-screen bg-gray-100">
      <div className="form w-full max-w-md p-8 bg-white shadow-md md:w-1/2 p-4">
        <div className="form-header w-full text-center mb-5">
          <h1 className="flex flex-wrap text-gray-900 items-center gap-x-3 justify-center text-2xl font-regular mb-2 text-center">
            <svg
              className="w-10 h-10 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z"
                fill="blue"
              />

              <path
                d="M8 12C8 12.5523 7.55228 13 7 13C6.44772 13 6 12.5523 6 12C6 11.4477 6.44772 11 7 11C7.55228 11 8 11.4477 8 12Z"
                fill="white"
              />
              <path
                d="M13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12Z"
                fill="white"
              />
              <path
                d="M18 12C18 12.5523 17.5523 13 17 13C16.4477 13 16 12.5523 16 12C16 11.4477 16.4477 11 17 11C17.5523 11 18 11.4477 18 12Z"
                fill="white"
              />
            </svg>
            WealthChat
          </h1>
          <h3 className="text-xl text-gray-900 mb-2">Sign in</h3>
          <p className="text-md text-gray-900">
            Sign in to continue to WealthChat.
          </p>
        </div>
        <div className="form-body mb-5">
          <form onSubmit={handleSubmit} action="#" method="post">
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-900 text-sm font-regular mb-2"
              >
                Email
              </label>
              <input
                type="text"
                id="email"
                className="w-full px-3 text-gray-900 py-2 border rounded-sm focus:outline-none focus:none"
                name="email"
                placeholder="Enter Email"
                onChange={handleChange}
                value={formData.email}
              />
              {errors.email && (
                <p className="text-red-500">{errors.email[0]}</p>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-900 text-sm font-regular mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full text-gray-900 px-3 py-2 border rounded-sm focus:outline-gray-900 focus:none"
                name="password"
                placeholder="Enter Password"
                onChange={handleChange}
                value={formData.password}
              />
              {errors.password && (
                <p className="text-red-500">{errors.password[0]}</p>
              )}
            </div>
            <div className="mb-4 flex flex-wrap justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 text-sm font-medium text-gray-900"
                >
                  Remember me
                </label>
              </div>
              <div className="mt-2 sm:mt-0">
                <a href="#" className="text-gray-900 text-sm font-regular">
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <button
                className="bg-blue-500 w-full hover:bg-blue-700 text-white font-regular py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </div>
          </form>
        </div>
        <div className="form-footer text-gray-800 flex justify-center items-center">
          <p>
            Don&apos;t have an account?
            <a href="/register" className="text-blue-700 font-regular">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
