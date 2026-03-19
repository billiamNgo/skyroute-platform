const API_BASE = "http://localhost:8080";

export { API_BASE };

export function getToken(): string | null {
    return localStorage.getItem("token");
}

export function getRole(): string | null {
    return localStorage.getItem("role");
}

export function getEmail(): string | null {
    return localStorage.getItem("email");
}

export function setAuth(token: string, role: string, email: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("email", email);
}

export function clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
}

export async function logoutUser() {
    const token = getToken();

    try {
        if (token) {
            await fetch(`${API_BASE}/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
        }
    } catch (error) {
        console.error("Logout request failed:", error);
    } finally {
        clearAuth();
        window.location.replace("/login");
    }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = getToken();

    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    };

    if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    return response;
}