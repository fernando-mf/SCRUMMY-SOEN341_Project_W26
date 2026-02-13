import { HttpStatus } from "@api/helpers/http";

// apiError represents our custom errors, see `ErrorMiddleware` in backend/src/http/middleware.ts
type apiError = { code: string };

// isAppError assumes that if `code` is present, we have an app error
function isAppError(data: unknown): data is apiError {
  return typeof data === "object" && data != null && "code" in data && typeof data.code === "string";
}

export class ApiError extends Error {
  public status: number;
  public code: string;

  constructor(status: number, error: apiError) {
    const { code, ...rest } = error;
    super(`${status}: ${code}: ${JSON.stringify(rest)}`);

    this.status = status;
    this.code = code;
  }
}

type requestOptions = {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
};

export class ApiClient {
  private accessToken?: string;

  constructor(private baseUrl: string) {}

  async Request<T>(req: requestOptions) {
    const params: RequestInit = {
      method: req.method,
      body: req.body ? JSON.stringify(req.body) : undefined,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    if (this.accessToken) {
      params.headers = { ...params.headers, Authorization: `Bearer ${this.accessToken}` };
    }

    const res = await fetch(`${this.baseUrl}${req.url}`, params);

    if (!res.ok) {
      const rawError = await res.json();
      if (isAppError(rawError)) {
        throw new ApiError(res.status, rawError);
      }
    }

    if (res.status === HttpStatus.NoContent) {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  }

  SetAccessToken(token: string) {
    this.accessToken = token;
  }
}
