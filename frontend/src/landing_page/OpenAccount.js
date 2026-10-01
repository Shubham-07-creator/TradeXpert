import React from "react";
import { Link } from "react-router-dom";

function OpenAccount() {
  return (
    <div className="py-5 open-account-section" style={{ background: "linear-gradient(135deg, #1B4D85 0%, #387ED1 50%, #00D09C 100%)", position: "relative", overflow: "hidden" }}>
      <div className="container py-5 text-center text-white position-relative fade-up" style={{ zIndex: 1 }}>
        <h1 className="display-4 fw-bold mb-4">Open a TradeXpert Account</h1>
        <p className="lead mb-5" style={{ opacity: 0.9, maxWidth: "600px", margin: "0 auto" }}>
          Modern platforms and apps, ₹0 investments, and flat ₹20 intraday and F&O trades. Start your professional trading journey today.
        </p>

        <Link
          to="/signup"
          className="btn btn-light btn-lg hover-scale open-account-btn"
          style={{ 
            color: "#1B4D85", 
            fontWeight: "700", 
            padding: "15px 40px", 
            borderRadius: "30px",
            boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}
        >
          Sign up Now
        </Link>
      </div>
      
      {/* Decorative floating elements */}
      <div className="position-absolute" style={{ top: "10%", left: "5%", width: "100px", height: "100px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", animation: "float 6s ease-in-out infinite" }}></div>
      <div className="position-absolute" style={{ bottom: "10%", right: "10%", width: "150px", height: "150px", background: "rgba(255,255,255,0.05)", borderRadius: "50%", animation: "float 8s ease-in-out infinite reverse" }}></div>
    </div>
  );
}

export default OpenAccount;