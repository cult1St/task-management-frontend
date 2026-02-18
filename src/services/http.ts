import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
if (!baseURL) {
    // Helpful warning during development if env is missing
    // eslint-disable-next-line no-console
    console.warn("NEXT_PUBLIC_BACKEND_BASE_URL is not set. Requests will use a relative URL.");
}

const http = axios.create({
    baseURL: baseURL ?? "",
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
                sessionStorage.removeItem("authUser");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default http;
