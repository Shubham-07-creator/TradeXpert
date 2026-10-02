import React from "react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <div className="container">
      <div className="row p-3 p-lg-5 mt-3 mt-lg-5 mb-3 mb-lg-5">
        <h1 className="fs-2 text-center fw-bold" style={{ lineHeight: "1.4" }}>
          We pioneered the discount broking model in India
          <br />
          <span className="text-gradient-primary">Now, we are breaking ground with our technology.</span>
        </h1>
      </div>

      <div
        className="row p-3 p-lg-5 mt-2 mt-lg-4 border-top g-4"
        style={{ lineHeight: "1.8", fontSize: "1.1em" }}
      >
        <div className="col-12 col-lg-6 p-2 p-lg-4">
          <p>
            We kick-started operations with the goal of breaking all barriers
            that traders and investors face in India in terms of cost, execution speed,
            support, and technology. We named the platform TradeXpert — built by traders,
            for traders, combining cutting-edge technology with zero-barrier pricing.
          </p>
          <p>
            Today, our disruptive pricing models and in-house technology have
            made us the biggest stock broker in India.
          </p>
          <p>
            Over 1.6+ crore clients place billions of orders every year through
            our powerful ecosystem of investment platforms, contributing over
            15% of all Indian retail trading volumes.
          </p>
        </div>
        <div className="col-12 col-lg-6 p-2 p-lg-4">
          <p>
            In addition, we run a number of popular open online educational and
            community initiatives to empower retail traders and investors.
          </p>
          <p>
            <Link to="/about" style={{ textDecoration: "none" }}>Rainmatter</Link>, our fintech fund and incubator, has
            invested in several fintech startups with the goal of growing the
            Indian capital markets.
          </p>
          <p>
            And yet, we are always up to something new every day. Catch up on
            the latest updates on our blog or see what the media is saying about
            us or learn more about our business and product philosophies.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Hero;
