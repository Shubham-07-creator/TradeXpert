import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";

import HomePage from "./landing_page/home/HomePage";
import Login from "./landing_page/login/Login";
import Signup from "./landing_page/signup/Signup";
import Profile from "./landing_page/profile/Profile";

import AboutPage from "./landing_page/about/AboutPage";
import ProductPage from "./landing_page/products/ProductsPage";
import PricingPage from "./landing_page/pricing/PricingPage";
import SupportPage from "./landing_page/support/SupportPage";

import NotFound from "./landing_page/NotFound";
import Navbar from "./landing_page/Navbar";
import Footer from "./landing_page/Footer";

// Wrapping the routes in a div keyed by pathname forces a fresh
// mount whenever the page changes, which replays the .page-fade CSS
// animation — a simple, dependency-free page transition.
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="page-fade" key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/about" element={<AboutPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/support" element={<SupportPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Toaster />

      <AnimatedRoutes />

      <Footer />
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<App />);