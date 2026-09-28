import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import Apps from "./Apps";
import Funds from "./Funds";
import Holdings from "./Holdings";

import Orders from "./Orders";
import Positions from "./Positions";
import Summary from "./Summary";
import WatchList from "./WatchList";
import Leaderboard from "./Leaderboard";
import AdminPanel from "./AdminPanel";
import { GeneralContextProvider } from "./GeneralContext";

const Dashboard = () => {
  const location = useLocation();

  return (
    <div className="dashboard-container">
      <GeneralContextProvider>
        <WatchList />
      </GeneralContextProvider>
      <div className="content">
        {/* key={pathname} forces a remount on every tab switch, which
            replays the .page-fade CSS animation — a lightweight page
            transition with no extra library. */}
        <div className="page-fade" key={location.pathname}>
          <Routes location={location}>
            <Route exact path="/" element={<Summary />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/holdings" element={<Holdings />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/funds" element={<Funds />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/apps" element={<Apps />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;