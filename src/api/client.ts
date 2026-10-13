let csrfToken: string | null = null;
export const setCsrfToken = (value: string | null) => {
  csrfToken = value;
};
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (csrfToken && options.method && options.method !== "GET")
    headers.set("X-CSRF-Token", csrfToken);
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      headers,
      credentials: "same-origin",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    throw new ApiError(
      0,
      "서버에 연결하지 못했어요. 연결을 확인하고 다시 시도해 주세요.",
    );
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    if (response.status === 401 && !path.startsWith("/auth/"))
      window.dispatchEvent(new Event("session-expired"));
    throw new ApiError(
      response.status,
      typeof data?.detail === "string"
        ? data.detail
        : response.status === 422
          ? "입력값의 길이와 형식을 확인해 주세요."
          : "요청을 처리하지 못했어요. 다시 시도해 주세요.",
    );
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요.";
