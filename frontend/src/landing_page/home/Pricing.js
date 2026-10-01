import React from 'react';
import { Link } from 'react-router-dom';

function Pricing() {
    return (
        <section className='section pricing-section py-5'>
            <div className='container'>
                <div className='row align-items-center'>
                    <div className='col-lg-5 mb-5 mb-lg-0 fade-up stagger-1'>
                        <h1 className='fs-2 fw-bold mb-4 pricing-title'>Unbeatable pricing</h1>
                        <p className='fs-5 mb-4 pricing-subtitle' style={{ lineHeight: '1.6' }}>
                            We pioneered the concept of discount broking and price transparency in India. Flat fees and no hidden charges.
                        </p>
                        <Link to='/pricing' className='btn btn-link p-0 text-decoration-none fw-semibold fs-5 d-inline-flex align-items-center' style={{ color: 'var(--primary)' }}>
                            See Pricing <i className="fa-solid fa-arrow-right-long ms-2"></i>
                        </Link>
                    </div>
                    
                    <div className='col-lg-7'>
                        <div className='row g-4'>
                            <div className='col-sm-6 scale-in stagger-2'>
                                <div className='card h-100 text-center pricing-card'>
                                    <div className='card-body d-flex flex-column justify-content-center'>
                                        <h1 className='display-4 fw-bold mb-3 pricing-val'>
                                            ₹0
                                        </h1>
                                        <p className='fs-5 m-0 fw-medium pricing-text'>
                                            Free equity delivery and<br/>direct mutual funds
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className='col-sm-6 scale-in stagger-3'>
                                <div className='card h-100 text-center pricing-card'>
                                    <div className='card-body d-flex flex-column justify-content-center'>
                                        <h1 className='display-4 fw-bold mb-3 pricing-val'>
                                            ₹20
                                        </h1>
                                        <p className='fs-5 m-0 fw-medium pricing-text'>
                                            Intraday and<br/>F&O trades
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .pricing-card:hover {
                    transform: translateY(-10px) scale(1.02);
                    box-shadow: var(--shadow-lg) !important;
                    border-color: rgba(56, 126, 209, 0.3) !important;
                }
            `}</style>
        </section>
    );
}

export default Pricing;