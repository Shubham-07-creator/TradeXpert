export const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3002";

export const DASHBOARD_URL =
  process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3001";

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