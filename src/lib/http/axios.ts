import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig } from "axios";
import { authToken } from "./auth-token";
import { ApiError, getApiErrorMessage } from "./errors";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  process.env.API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

type RetryConfig = AxiosRequestConfig & { _retry?: boolean };

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = authToken.get();
  if (!token) return config;

  const headers = AxiosHeaders.from(config.headers);
  if (!headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  config.headers = headers;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const canRefresh =
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      original.url !== "/api/auth/refresh";

    if (canRefresh && original) {
      original._retry = true;

      try {
        await axiosInstance.post("/api/auth/refresh");
        return axiosInstance(original);
      } catch {
        authToken.clear();
      }
    }

    const payload = error.response?.data;
    const message = getApiErrorMessage(payload, error.message || "Request failed");
    throw new ApiError(message, error.response?.status, payload);
  },
);

const unwrap = <T>(payload: ApiEnvelope<T> | T) => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
};

export const apiClient = {
  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await axiosInstance.get<ApiEnvelope<T> | T>(url, config);
    return unwrap<T>(response.data);
  },
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await axiosInstance.post<ApiEnvelope<T> | T>(url, data, config);
    return unwrap<T>(response.data);
  },
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await axiosInstance.patch<ApiEnvelope<T> | T>(url, data, config);
    return unwrap<T>(response.data);
  },
  async delete<T = void>(url: string, config?: AxiosRequestConfig) {
    const response = await axiosInstance.delete<ApiEnvelope<T> | T>(url, config);
    return unwrap<T>(response.data);
  },
};
