import axios from "axios";

const BASE_URL = "https://vibora-xrh1.onrender.com"; // your backend URL

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies if backend requires
});

export default axiosInstance;
