import React from 'react';
import { Link } from 'react-router-dom';

function Universe() {
  return ( 
    <div className="container mt-4 mt-lg-5">
      <div className="row text-center justify-content-center">
        <h1 className="fw-bold mb-2">The TradeXpert Universe</h1>
        <p className="fs-5 text-muted mb-4" style={{ maxWidth: "650px", margin: "0 auto" }}>
          Extend your trading and investment experience even further with our partner platforms
        </p>

        <div className="col-12 col-sm-6 col-lg-4 p-3 mt-3 mt-lg-4">
          <img src="media/images/smallcaseLogo.png" className="partner-logo img-fluid" alt="Smallcase" style={{ maxHeight: "48px" }} />
          <p className="text-muted mt-2 small">Thematic investment platform</p>
        </div>

        <div className="col-12 col-sm-6 col-lg-4 p-3 mt-3 mt-lg-4">
          <img src="media/images/streakLogo.png" className="partner-logo img-fluid" alt="Streak" style={{ maxHeight: "48px" }} />
          <p className="text-muted mt-2 small">
            Systematic trading platform that allows you to create and backtest strategies without coding.
          </p>
        </div>

        <div className="col-12 col-sm-6 col-lg-4 p-3 mt-3 mt-lg-4">
          <img src="media/images/sensibullLogo.svg" className="partner-logo img-fluid" alt="Sensibull" style={{ maxHeight: "48px" }} />
          <p className="text-muted mt-2 small">
            Options trading platform that lets you create strategies and analyze positions.
          </p>
        </div>

        <div className="col-12 col-sm-6 col-lg-4 p-3 mt-3 mt-lg-4">
          <img src="media/images/zerodhaFundhouse.png" className="partner-logo img-fluid" alt="Fundhouse" style={{ maxHeight: "48px" }} />
          <p className="text-muted mt-2 small">
            Our asset management venture creating simple index funds.
          </p>
        </div>

        <div className="col-12 col-sm-6 col-lg-4 p-3 mt-3 mt-lg-4">
          <img src="media/images/goldenpiLogo.png" className="partner-logo img-fluid" alt="GoldenPi" style={{ maxHeight: "48px" }} />
          <p className="text-muted mt-2 small">Bonds trading platform</p>
        </div>

        <div className="col-12 col-sm-6 col-lg-4 p-3 mt-3 mt-lg-4">
          <img src="media/images/dittoLogo.png" className="partner-logo img-fluid" alt="Ditto" style={{ maxHeight: "48px" }} />
          <p className="text-muted mt-2 small">
            Personalized advice on life and health insurance.
          </p>
        </div>

        <div className="col-12 mt-4 mb-5">
          <Link
            to="/signup"
            className="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-sm hover-scale d-inline-flex align-items-center justify-content-center gap-2"
            style={{ width: "min(320px, 90%)", fontSize: "1.05rem" }}
          >
            <span>Sign Up Now</span>
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Universe;