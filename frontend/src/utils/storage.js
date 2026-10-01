const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

export const API_URL = isLocalhost
  ? "http://localhost:3002"
  : process.env.REACT_APP_API_URL || "https://tradexpert-backend-q7pf.onrender.com";

export const DASHBOARD_URL = isLocalhost
  ? "http://localhost:3001"
  : process.env.REACT_APP_DASHBOARD_URL || "https://tradexpert-dashboard.onrender.com";

export const getStoredUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Failed to read stored user:", error);
    return null;
  }
};

export const goToDashboard = (dashboardUrl = DASHBOARD_URL) => {
  window.location.href = dashboardUrl;
};