import http from "./http";
import { AxiosError } from "axios";
import { RegisterDTO, ErrorResponse, LoginDTO } from "@/dto/auth";

class AuthService {
  async login(formData : LoginDTO) {
    try {
      const response = await http.post("/auth/login", formData);

      if (typeof window != "undefined") {
        sessionStorage.setItem("authToken", response.data?.data?.token);
      }

      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const data = axiosError.response?.data;
      // Return the errors object to the caller instead of throwing Error
      return Promise.reject(data || { message: "Network error" });
    }
  }

  async register(formData: RegisterDTO) {
    try {
      const response = await http.post("/auth/register", formData);

      if (typeof window != "undefined") {
        sessionStorage.setItem("authToken", response.data?.data?.token);
      }

      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const data = axiosError.response?.data;
      // Return the errors object to the caller instead of throwing Error
      return Promise.reject(data || { message: "Network error" });
    }
  }

  async logout() {
    try {
      const response = await http.delete("/auth/logout");
      if (typeof window != "undefined") {
        sessionStorage.removeItem("authToken");
      }

      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Network error";

      throw new Error(message);
    }
  }

  async getProfile() {
    try {
      const response = await http.get("/user/me");
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Network error";

      throw new Error(message);
    }
  }
}

const authService = new AuthService();
export default authService;
