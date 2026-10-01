import React, { useEffect, useState } from "react";

import Dashboard from "./Dashboard";
import TopBar from "./TopBar";
import { isLoggedIn, bootstrapAuthFromUrl, FRONTEND } from "../utils/auth";

const Home = () => {

  const [ready, setReady] = useState(false);

  useEffect(() => {
    // bootstrapAuthFromUrl is now async — it exchanges a one-time
    // code with the backend for a real token. Wait for it to finish
    // before checking isLoggedIn().
    const init = async () => {
      await bootstrapAuthFromUrl();
      setReady(true);

      if (!isLoggedIn()) {
        window.location.href = `${FRONTEND}/login`;
      }
    };
    init();
  }, [FRONTEND]);

  if (!ready || !isLoggedIn()) {
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