import React from 'react';

function RightSection({ imageURL, productName, productDescription, learnMore }) {
  return (
    <div className="container mt-4 mt-lg-5">
      <div className="row align-items-center g-4">
        <div className="col-12 col-lg-6 p-3 p-lg-5 order-2 order-lg-1">
          <h1 className="fw-bold mb-3 fs-2">{productName}</h1>
          <p className="text-muted mb-4 lead" style={{ fontSize: "1.05rem", lineHeight: "1.7" }}>
            {productDescription}
          </p>
          <div>
            <a href={learnMore} className="fw-semibold" style={{ textDecoration: "none" }}>
              Learn More <i className="fa-solid fa-arrow-right-long ms-1"></i>
            </a>
          </div>
        </div>
        <div className="col-12 col-lg-6 text-center text-lg-start order-1 order-lg-2">
          <img
            src={imageURL}
            alt={productName}
            className="img-fluid"
            style={{ maxHeight: "380px" }}
          />
        </div>
      </div>
    </div>
  );
}

export default RightSection;