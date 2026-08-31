const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type ApiFetchOptions = RequestInit & { json?: unknown };

function getToken(): string | null {
  try {
    return localStorage.getItem("utkarsh-jwt");
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { json, headers: initHeaders, ...rest } = options;

  const headers = new Headers(initHeaders as HeadersInit);

  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
    rest.body = JSON.stringify(json);
  } else if (!headers.has("Content-Type") && rest.body === undefined) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers,
    });
  } catch (err) {
    throw new ApiError(0, "Network error — could not reach the server", err);
  }

  const text = await response.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    const message =
      (body as Record<string, string>)?.message ??
      (body as Record<string, string>)?.error ??
      `Request failed (${response.status})`;
    throw new ApiError(response.status, message, body);
  }

  return body as T;
}

export function apiPublic<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  return request<T>(path, {
    ...options,
    headers: { ...options.headers as Record<string, string> },
  });
}

export function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  return request<T>(path, options);
}

export type { ApiFetchOptions };
