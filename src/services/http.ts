import axios from "axios";

const http = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
    timeout: 100000
});


//request interceptor( handle auth token )
http.interceptors.request.use((config) => {
    if(typeof window != "undefined"){
        const token = sessionStorage.getItem("authToken");
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

//response interceptor( handle errors )
http.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response?.status == 401){
            if(typeof window != "undefined"){
                sessionStorage.removeItem("authToken");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default http;