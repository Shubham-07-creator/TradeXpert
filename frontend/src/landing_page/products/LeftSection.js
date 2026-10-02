import React from "react";

function LeftSection({
  imageURL,
  productName,
  productDescription,
  tryDemo,
  learnMore,
  googlePlay,
  appStore,
}) {
  return (
    <div className="container mt-4 mt-lg-5">
      <div className="row align-items-center g-4">
        <div className="col-12 col-lg-6 text-center text-lg-start">
          <img
            src={imageURL}
            alt={productName}
            className="img-fluid"
            style={{ maxHeight: "380px" }}
          />
        </div>
        <div className="col-12 col-lg-6 p-3 p-lg-5">
          <h1 className="fw-bold mb-3 fs-2">{productName}</h1>
          <p className="text-muted mb-4 lead" style={{ fontSize: "1.05rem", lineHeight: "1.7" }}>
            {productDescription}
          </p>
          <div className="d-flex flex-wrap gap-4 align-items-center mb-4">
            <a href={tryDemo} className="fw-semibold" style={{ textDecoration: "none" }}>
              Try Demo <i className="fa-solid fa-arrow-right-long ms-1"></i>
            </a>
            <a href={learnMore} className="fw-semibold" style={{ textDecoration: "none" }}>
              Learn More <i className="fa-solid fa-arrow-right-long ms-1"></i>
            </a>
          </div>
          <div className="d-flex flex-wrap gap-3 align-items-center">
            <a href={googlePlay} className="hover-scale">
              <img src="media/images/googlePlayBadge.svg" alt="Google Play" style={{ height: "40px" }} />
            </a>
            <a href={appStore} className="hover-scale">
              <img src="media/images/appstoreBadge.svg" alt="App Store" style={{ height: "40px" }} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftSection;