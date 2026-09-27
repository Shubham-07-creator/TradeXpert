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

// UI-only convenience to show/hide the Admin nav link. The backend's
// adminMiddleware is what actually enforces this — even if someone
// bypasses this check in the browser, /admin/* routes reject any
// email other than this one.
const ADMIN_EMAIL = "shubhamkumar979883@gmail.com";

export const isAdmin = () => getCurrentUser()?.email === ADMIN_EMAIL;

// Frontend (localhost:3000) and Dashboard (localhost:3001) are two
// different origins, so localStorage set on one is invisible on the
// other. The frontend passes the token/user as URL query params on
// redirect; this pulls them into the dashboard's own localStorage and
// then cleans the URL so the token isn't left visible/bookmarked.
export const bootstrapAuthFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const user = params.get("user");

  if (!token) return;

  localStorage.setItem("token", token);
  if (user) {
    localStorage.setItem("user", user);
  }

  params.delete("token");
  params.delete("user");

  const cleanUrl =
    window.location.pathname +
    (params.toString() ? `?${params.toString()}` : "") +
    window.location.hash;

  window.history.replaceState({}, "", cleanUrl);
};