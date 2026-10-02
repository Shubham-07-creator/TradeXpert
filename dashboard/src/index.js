import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import Home from "./components/Home";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "custom-fintech-toast",
          duration: 3500,
          style: {
            background: "var(--color-bg-card)",
            color: "var(--color-text-strong)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            fontSize: "0.88rem",
            fontWeight: "600",
            padding: "12px 18px",
            fontFamily: "Inter, system-ui, -apple-system, sans-serif",
            backdropFilter: "blur(8px)",
          },
          success: {
            iconTheme: {
              primary: "#00D09C",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <Routes>
        <Route path="/*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </>
);