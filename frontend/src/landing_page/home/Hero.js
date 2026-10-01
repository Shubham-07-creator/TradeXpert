import React from 'react';
import { Link } from 'react-router-dom';

function Hero() {
    return (
        <div className="hero-section">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6 fade-up stagger-1">
                        <h1 className="hero-title display-4 fw-bold mb-4">
                            Invest in <span style={{ color: "var(--accent)" }}>Everything</span>
                        </h1>
                        <p className="lead mb-5 hero-lead" style={{ fontSize: "1.2rem" }}>
                            The professional online platform to invest in stocks, derivatives, mutual funds, ETFs, bonds, and more. Join millions of traders today.
                        </p>
                        
                        <Link
                            to="/signup"
                            className="btn btn-primary btn-lg shadow-md hover-scale"
                            style={{ 
                                background: "linear-gradient(135deg, #387ED1 0%, #00D09C 100%)",
                                border: "none",
                                padding: "12px 32px",
                                borderRadius: "30px",
                                fontWeight: "600"
                            }}
                        >
                            Signup Now
                        </Link>
                        
                        <div className="row mt-5 pt-4 border-top fade-up stagger-2">
                            <div className="col-4">
                                <h3 className="fw-bold mb-0 hero-stat-val">2M+</h3>
                                <small className="hero-stat-label">Active Users</small>
                            </div>
                            <div className="col-4">
                                <h3 className="fw-bold mb-0 hero-stat-val">₹6L Cr+</h3>
                                <small className="hero-stat-label">Daily Volume</small>
                            </div>
                            <div className="col-4">
                                <h3 className="fw-bold mb-0 hero-stat-val">4.9/5</h3>
                                <small className="hero-stat-label">App Rating</small>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-6 text-center mt-5 mt-lg-0 fade-up stagger-3">
                        <img 
                            src="media/images/homeHero.png" 
                            alt="Hero" 
                            className="img-fluid floating-animation" 
                            style={{ maxWidth: "90%", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.1))" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Hero;