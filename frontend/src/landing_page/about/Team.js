import React from "react";

function Team() {
  return (
    <div className="container">
      <div className="row p-3 mt-5 border-top">
        <h1 className="text-center">People</h1>
      </div>

      <div
        className="row p-3 text-muted"
        style={{ lineHeight: "1.8", fontSize: "1.2em" }}
      >
        <div className="col-6 p-3 text-center">
          <img
            src="media/images/shubham.logo.png"
            style={{ width: "50%", borderRadius: "100%" }}
          />
          <h4 className="mt-5">SHUBHAM KUMAR</h4>
          <h6>Founder, CEO</h6>
        </div>
        <div className="col-6 p-3">
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
          <p className="col2"><b>
            Connect on:</b> <a href="">Homepage</a> / <a href="">TradingQnA</a> /{" "}
            <a href="">Twitter</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Team;
