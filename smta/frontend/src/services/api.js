import axios from "axios";

// In dev, Vite proxies "/api" to the FastAPI backend (see vite.config.js).
// In production, set VITE_API_BASE_URL to your deployed backend URL.
const baseURL = import.meta.env.VITE_API_BASE_URL || "";

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

// Every call is wrapped so components can rely on a consistent
// { data, error } shape instead of catching raw axios errors everywhere.
async function safeGet(url, params) {
  try {
    const res = await api.get(url, { params });
    return { data: res.data, error: null };
  } catch (err) {
    return { data: null, error: describeError(err) };
  }
}

async function safePost(url, body) {
  try {
    const res = await api.post(url, body);
    return { data: res.data, error: null };
  } catch (err) {
    return { data: null, error: describeError(err) };
  }
}

function describeError(err) {
  if (err.response) {
    const msg = err.response.data?.message;
    if (err.response.status === 401 || err.response.status === 403) {
      return "Invalid or missing API credentials.";
    }
    return msg || `Request failed (${err.response.status}).`;
  }
  if (err.request) {
    return "Can't reach the backend. Check that the API server is running.";
  }
  return "Something went wrong preparing that request.";
}

export const endpoints = {
  dashboard: () => safeGet("/api/dashboard"),
  trends: (limit) => safeGet("/api/trends", { limit }),
  sentiment: () => safeGet("/api/sentiment"),
  topics: () => safeGet("/api/topics"),
  engagement: (topN) => safeGet("/api/engagement", { top_n: topN }),
  posts: (params) => safeGet("/api/posts", params),
  status: () => safeGet("/api/status"),
  fetchNewData: () => safePost("/api/fetch-data"),
};
