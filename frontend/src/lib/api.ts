const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth_token");
  const hasBody = options.body !== undefined && options.body !== null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (hasBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "An error occurred while fetching the api") as Error & Record<string, any>;
    Object.assign(error, data);
    throw error;
  }

  return data;
}
