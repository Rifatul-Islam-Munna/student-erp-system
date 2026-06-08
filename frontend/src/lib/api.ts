const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "An error occurred while fetching the api");
  }

  return data;
}
