//import axios from "axios";
import axios from "../api/axios";
import { useLayoutEffect, useState, useEffect, useRef } from "react";
import { useContext } from "react";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return authContext;
};

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ accessToken: null, user: null });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const alertShownRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  // Set token from localStorage on mount
  useLayoutEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken);
        // the decoded user will be an object with {id:...,role:..., email:...}that is signed in payload
        setAuth({ accessToken: storedToken, user: decodedUser });
      } catch (e) {
        console.error("Invalid stored token", e);
        localStorage.removeItem("accessToken");
      }
    }
    setLoading(false); // <-- set loading to false after check
  }, []);
  useLayoutEffect(() => {
    const authInterceptor = axios.interceptors.request.use((config) => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      console.log("Request config with auth:", config);
      return config;
    });
    return () => {
      axios.interceptors.request.eject(authInterceptor);
    };
  }, [auth]);
  useLayoutEffect(() => {
  const refreshInterceptor = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // ✅ Kiểm tra trước khi dùng
      if (!originalRequest) {
        console.error("Axios error without config:", error);
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401) {
        if (isRefreshing) {
          return Promise.reject(error);
        }

        setIsRefreshing(true);
        originalRequest._retry = true;

        try {
          const response = await axios.get(`${BASE_URL}/auth/refresh`, {
            withCredentials: true,
          });

          console.log("Through cookie refresh");

          const newAccessToken = response.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);
          setIsRefreshing(false);

          // Gắn lại header Authorization và thử gửi lại request ban đầu
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          setIsRefreshing(false);
          console.log("Request refresh token failed: ", refreshError);

          if (!alertShownRef.current) {
            alertShownRef.current = true;
            alert("This account is offline too long! Please try to login again.");
            setTimeout(() => {
              alertShownRef.current = false;
              nav("/login");
            }, 0);
          }

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return () => {
    axios.interceptors.response.eject(refreshInterceptor);
  };
}, [nav, isRefreshing]);

  return (

    <AuthContext.Provider value={{ auth, setAuth, loading }}>
      {children}
    </AuthContext.Provider>

  );
};
export default AuthProvider;
