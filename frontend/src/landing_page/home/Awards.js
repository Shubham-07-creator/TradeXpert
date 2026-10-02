import React from 'react';

function Awards() {
  const ASSETS = [
    { title: "Equities & IPOs", desc: "Delivery & Intraday cash", icon: "fa-solid fa-chart-line" },
    { title: "Futures & Options", desc: "Indices & single stocks", icon: "fa-solid fa-bolt" },
    { title: "Direct Mutual Funds", desc: "Zero commission SIPs", icon: "fa-solid fa-piggy-bank" },
    { title: "Commodity Derivatives", desc: "Gold, Silver, Crude & Metals", icon: "fa-solid fa-cubes" },
    { title: "Currency Derivatives", desc: "USDINR, EURINR & Crosses", icon: "fa-solid fa-coins" },
    { title: "Bonds & Govt. Securities", desc: "Sovereign Gold & T-Bills", icon: "fa-solid fa-landmark" },
  ];

  return (
    <section className="section awards-section fade-up">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-5 text-center fade-up">
            <img
              src="media/images/largestBroker.svg"
              alt="Largest Retail Stock Broker in India"
              className="img-fluid floating-animation"
              style={{ maxWidth: "88%", filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.06))" }}
            />
          </div>

          <div className="col-lg-7 fade-up stagger-1">
            <span className="badge-fintech mb-2">PROVEN MARKET LEADERSHIP</span>
            <h2 className="display-6 fw-bold mb-3" style={{ letterSpacing: "-0.03em" }}>
              India's premier retail investment powerhouse
            </h2>
            <p className="text-muted mb-4" style={{ fontSize: "1.05rem", lineHeight: "1.7" }}>
              Over 2+ million verified TradeXpert clients execute billions in trades annually, contributing to over 15% of all retail market volumes in India daily across key financial instruments:
            </p>

            {/* Asset Capabilities Grid */}
            <div className="row g-3 mb-4">
              {ASSETS.map((item, idx) => (
                <div className="col-sm-6" key={idx}>
                  <div className="asset-pill-card p-3 rounded-3 d-flex align-items-center gap-3">
                    <div className="asset-icon-circle">
                      <i className={item.icon}></i>
                    </div>
                    <div>
                      <div className="fw-bold text-dark small">{item.title}</div>
                      <div className="text-muted" style={{ fontSize: "0.78rem" }}>{item.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Press coverage logos */}
            <div className="pt-3 border-top">
              <span className="text-muted small fw-semibold text-uppercase d-block mb-3" style={{ letterSpacing: "1px" }}>
                Featured across leading financial media:
              </span>
              <img
                src="media/images/pressLogos.png"
                alt="Financial Media Coverage"
                className="img-fluid hover-opacity"
                style={{ width: "95%", opacity: "0.75", transition: "opacity 0.3s ease" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Awards;