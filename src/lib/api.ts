const API_BASE_URL =
import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

type ApiOptions = RequestInit & {
token?: string | null;
};

export async function apiRequest<T>(
endpoint: string,
options: ApiOptions = {},
): Promise<T> {
const { token, headers, ...requestOptions } = options;

const response = await fetch(`${API_BASE_URL}${endpoint}`, {
...requestOptions,
headers: {
Accept: "application/json",
"Content-Type": "application/json",
...(token ? { Authorization: `Bearer ${token}` } : {}),
...headers,
},
});

const data = await response.json().catch(() => ({}));

if (!response.ok) {
const message =
data.message || data.error || "Something went wrong. Please try again.";


throw new Error(message);


}

return data as T;
}
