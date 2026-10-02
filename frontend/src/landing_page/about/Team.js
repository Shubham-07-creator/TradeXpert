import React from "react";

function Team() {
  return (
    <div className="container">
      <div className="row p-3 mt-4 mt-lg-5 border-top">
        <h1 className="text-center fw-bold">People</h1>
      </div>

      <div
        className="row align-items-center g-4 p-2 p-lg-3"
        style={{ lineHeight: "1.8", fontSize: "1.1em" }}
      >
        <div className="col-12 col-lg-5 p-3 text-center">
          <img
            src="media/images/shubham.logo.png"
            alt="Shubham Kumar"
            className="img-fluid shadow-sm"
            style={{ width: "min(220px, 60%)", borderRadius: "100%" }}
          />
          <h4 className="mt-4 fw-bold mb-1">SHUBHAM KUMAR</h4>
          <h6 className="text-muted">Founder, CEO</h6>
        </div>
        <div className="col-12 col-lg-7 p-3">
          <p>
            Shubham bootstrapped and built this trading platform to simplify
            investing and trading for modern users. Combining technology with
            financial awareness, he aims to create a seamless and transparent
            trading ecosystem inspired by innovation and user-first design.
          </p>
          <p>
            As a developer and market enthusiast, his mission is to empower
            individuals with better tools, knowledge, and confidence to
            participate in financial markets.
          </p>
          <p>
            When not building products, he enjoys learning about markets,
            technology trends, and startup growth.
          </p>
          <p className="mt-3">
            <b>Connect on:</b>{" "}
            <a href="https://github.com/Shubham-07-creator" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>GitHub</a> /{" "}
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>LinkedIn</a> /{" "}
            <a href="https://twitter.com" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>Twitter</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Team;
