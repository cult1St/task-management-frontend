"use client";

import { useState } from "react";
import authService from "@/services/auth.service";
import { RegisterDTO, ErrorResponse, ValidationErrors } from "@/dto/auth";
import Swal from "sweetalert2";
const RegisterPage = () => {
  const [formData, setFormData] = useState<RegisterDTO>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
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
      await authService.register(formData);

      setIsLoading(false);

      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "Redirecting To Chat Page",
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
          title: "Registration Failed",
          text: errData.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold flex justify-center items-center gap-3 text-gray-800">
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
          <h2 className="text-xl mt-2 text-gray-600">Create your account</h2>
          <p className="text-sm text-gray-500 mt-1">
            Join the conversation today
          </p>
        </div>

        <form action="#" onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="fname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Firstname
              </label>
              <input
                type="text"
                id="fname"
                name="first_name"
                onChange={handleChange}
                value={formData.first_name}
                placeholder="Enter Firstname"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.first_name && (
                <p className="text-red-500">{errors.first_name[0]}</p>
              )}
            </div>
            <div className="flex-1">
              <label
                htmlFor="lname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Lastname
              </label>
              <input
                type="text"
                id="lname"
                name="last_name"
                onChange={handleChange}
                value={formData.last_name}
                placeholder="Enter Lastname"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.last_name && (
                <p className="text-red-500">{errors.last_name[0]}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              onChange={handleChange}
              value={formData.email}
              placeholder="Enter Email"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.email && <p className="text-red-500">{errors.email[0]}</p>}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <div className="flex gap-2">
              <select
                id="country-call-id"
                name="country-call-id"
                className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="+234">+234</option>
              </select>
              <input
                type="tel"
                id="phone"
                name="phone"
                onChange={handleChange}
                value={formData.phone}
                placeholder="Enter Phone Number"
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.phone && (
                <p className="text-red-500">{errors.phone[0]}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={handleChange}
              value={formData.password}
              placeholder="Enter Password"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.password && (
              <p className="text-red-500">{errors.password[0]}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
