import { ErrorResponse } from "@/dto/auth";
import http from "./http";
import { AxiosError } from "axios";
import { ContactFormDTO, UserPofileUpdate } from "@/dto/user";

class UserService {
  async profile() {
    try {
      const response = await http.get("/users/me");

      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const data = axiosError.response?.data;
      // Return the errors object to the caller instead of throwing Error
      return Promise.reject(data || { message: "Network error" });
    }
  }

  async chats(){
    try{
      const response = await http.get('/users/chats');

      return response.data;
    }catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const data = axiosError.response?.data;
      // Return the errors object to the caller instead of throwing Error
      return Promise.reject(data || { message: "Network error" });
    }
  }

  
}
const userService = new UserService();
export default userService;
