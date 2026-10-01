// Small helper so every axios call to the backend sends the logged-in
// user's JWT. Without this every protected route in the backend
// (allHoldings, allPositions, orders, newOrder, profile...) will
// reject the request with 401 Unauthorized.
export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    return null;
  }
};

export const isLoggedIn = () => !!localStorage.getItem("token");

// Role-based admin check — the backend's adminMiddleware enforces
// this server-side; this is only for UI show/hide of the Admin link.
export const isAdmin = () => getCurrentUser()?.role === "admin";

// Frontend (localhost:3000) and Dashboard (localhost:3001) are two
// different origins, so localStorage set on one is invisible on the
// other. The frontend passes a short-lived one-time auth code as a
// URL query param; this exchanges it with the backend for a real
// token, saves into localStorage, then cleans the URL.
const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

export const bootstrapAuthFromUrl = async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (!code) return;

  // Clean URL immediately so the code isn't visible / bookmarkable
  params.delete("code");
  const cleanUrl =
    window.location.pathname +
    (params.toString() ? `?${params.toString()}` : "") +
    window.location.hash;
  window.history.replaceState({}, "", cleanUrl);

  try {
    const res = await fetch(`${API}/auth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!res.ok) {
      // Code expired or invalid — redirect to login
      const FRONTEND =
        process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";
      window.location.href = `${FRONTEND}/login`;
      return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  } catch (err) {
    console.error("Auth exchange failed:", err);
  }
};