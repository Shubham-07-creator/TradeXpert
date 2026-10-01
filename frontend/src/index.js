import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

import HomePage from "./landing_page/home/HomePage";
import Navbar from "./landing_page/Navbar";
import Footer from "./landing_page/Footer";

// Lazy-loaded routes for optimal initial page-load speed
const Login = React.lazy(() => import("./landing_page/login/Login"));
const Signup = React.lazy(() => import("./landing_page/signup/Signup"));
const ForgotPassword = React.lazy(() =>
  import("./landing_page/login/ForgotPassword")
);
const ResetPassword = React.lazy(() =>
  import("./landing_page/login/ResetPassword")
);
const Profile = React.lazy(() => import("./landing_page/profile/Profile"));
const AboutPage = React.lazy(() => import("./landing_page/about/AboutPage"));
const ProductPage = React.lazy(() =>
  import("./landing_page/products/ProductsPage")
);
const PricingPage = React.lazy(() =>
  import("./landing_page/pricing/PricingPage")
);
const SupportPage = React.lazy(() =>
  import("./landing_page/support/SupportPage")
);
const NotFound = React.lazy(() => import("./landing_page/NotFound"));

// Fallback spinner while lazy routes load
function LoadingFallback() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
      }}
    >
      <div
        className="spinner-border text-primary"
        role="status"
        style={{ width: "2.5rem", height: "2.5rem" }}
      >
        <span className="visually-hidden">Loading TradeXpert...</span>
      </div>
      <small className="text-muted fw-semibold">Loading TradeXpert...</small>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="page-fade main-content-wrapper" key={location.pathname}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/support" element={<SupportPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Toaster position="top-right" />
          <AnimatedRoutes />
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);