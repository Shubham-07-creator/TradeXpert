import React from "react";

function Hero() {
  return (
    <section id="supportHero">

      <div className="container">

        <div id="supportWrapper">
          <h4>Support Portal</h4>
          <a href="" className="fs-5">Track Tickets</a>
        </div>

        <div className="row supportRow">

          <div className="col-lg-7 leftHero">
            <h1>
              Search for an answer or browse help topics
              to create a ticket
            </h1>

            <input
              type="text"
              placeholder="Eg: how do i activate F&O, why is my order getting rejected.."
            />

            <div className="heroLinks">
              <a href="">Track account opening</a>
              <a href="">Track segment activation</a>
              <a href="">Intraday margins</a>
              <a href="">Kite user manual</a>
            </div>

          </div>

          <div className="col-lg-5 rightHero">
            <h4>Featured</h4>

            <ol>
              <li>
                <a href="">Current Takeovers and Delisting - January 2024</a>
              </li>
              <li>
                <a href="">Latest Intraday leverages - MIS & CO</a>
              </li>
            </ol>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;
