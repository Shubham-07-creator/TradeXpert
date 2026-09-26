import React, { useEffect } from "react";

import Dashboard from "./Dashboard";
import TopBar from "./TopBar";
import { isLoggedIn, bootstrapAuthFromUrl } from "../utils/auth";

// Runs once, as soon as this module loads — before Home's first
// render — so that a token/user passed via URL query params (from
// the frontend's login redirect) lands in localStorage before the
// isLoggedIn() check below runs.
bootstrapAuthFromUrl();

const Home = () => {
  const FRONTEND =
    process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = `${FRONTEND}/login`;
    }
  }, [FRONTEND]);

  if (!isLoggedIn()) {
    return null;
  }

  return (
    <>
      <TopBar />
      <Dashboard />
    </>
  );
};

export default Home;