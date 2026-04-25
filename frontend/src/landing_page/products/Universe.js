import React from 'react';

function Universe() {
  return ( 
    <div className="container mt-5">
      <div className="row text-center">

        <h1>The TradeXpert Universe</h1>
        &nbsp;
        <p className='fs-5'>
          Extend your trading and investment experience even further with our partner platforms
        </p>

        <div className="col-4 p-3 mt-5">
          <img src="media/images/smallcaseLogo.png" className="partner-logo"/>
          <p className='text-muted fs-5'>Thematic investment platform</p>
        </div>

        <div className="col-4 p-3 mt-5">
          <img src="media/images/streakLogo.png" className="partner-logo"/>
          <p className='text-muted fs-5'>
            Systematic trading platform that allows you to create and backtest strategies without coding.
          </p>
        </div>

        <div className="col-4 p-3 mt-5">
          <img src="media/images/sensibullLogo.svg" className="partner-logo"/>
          <p className='text-muted fs-5'>
            Options trading platform that lets you create strategies and analyze positions.
          </p>
        </div>

        <div className="col-4 p-3 mt-5">
          <img src="media/images/zerodhaFundhouse.png" className="partner-logo"/>
          <p className='text-muted fs-5'>
            Our asset management venture creating simple index funds.
          </p>
        </div>

        <div className="col-4 p-3 mt-5">
          <img src="media/images/goldenpiLogo.png" className="partner-logo"/>
          <p className='text-muted fs-5'>Bonds trading platform</p>
        </div>

        <div className="col-4 p-3 mt-5">
          <img src="media/images/dittoLogo.png" className="partner-logo"/>
          <p className='text-muted fs-5'>
            Personalized advice on life and health insurance.
          </p>
        </div>
        <button className='p-2 btn btn-primary fs-5 mb-5' style={{width:"20%", margin: "0 auto"}}>Sign up Now</button>

      </div>
    </div>
  );
}

export default Universe;