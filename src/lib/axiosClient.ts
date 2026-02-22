import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Browser base URL (only if calling Django directly from browser)
const PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// Server-only base URL (Route Handlers / Server Components)
const SERVER_API_BASE = process.env.DJANGO_API_BASE || PUBLIC_API_BASE;

type GetCookie = (name: string) => string | undefined;

function isUnsafeMethod(method?: string) {
    const m = (method ?? "GET").toUpperCase();
    return m === "POST" || m === "PUT" || m === "PATCH" || m === "DELETE";
}

/**
 * 1) Browser axios:
 * - Sends cookies automatically (if same-site rules allow)
 * - Cannot read HttpOnly token/CSRF, so it can't set Authorization or X-CSRFToken itself.
 *   (If you need CSRF header in browser, csrftoken must be NOT HttpOnly.)
 */
export const axiosBrowser = axios.create({
    baseURL: PUBLIC_API_BASE,
    withCredentials: true,
});

/**
 * 2) Server axios factory:
 * - Reads token + csrf from cookies (Route Handler / Server Component)
 * - Adds Authorization: Bearer <token>
 * - Adds X-CSRFToken for unsafe methods
 * - Forwards incoming cookie header too if you pass it via config.headers.cookie (recommended in proxy)
 */
export function axiosServer(getCookie: GetCookie) {
    const instance = axios.create({
        baseURL: SERVER_API_BASE,
        withCredentials: true,
    });

    instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
        config.headers = config.headers ?? {};

        // --- Add Authorization token from cookie ---
        const token = getCookie("access_token"); // <-- change cookie name if needed
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }


        // --- Add CSRF for unsafe methods ---
        const csrf = getCookie("csrftoken"); // <-- Django default CSRF cookie name
        if (csrf && isUnsafeMethod(config.method)) {
            config.headers["X-CSRFToken"] = csrf;
            // Django may also check Referer/Origin in strict configs
            // config.headers["Referer"] = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://localhost:3000";
        }
        return config;
    });

    return instance;
}

export function getAxiosErrorMessage(err: unknown) {
    if (axios.isAxiosError(err)) {
        const ae = err as AxiosError<any>;
        return ae.response?.data?.detail || ae.response?.data?.error || ae.message;
    }
    return err instanceof Error ? err.message : "Unknown error";
}