import React from 'react';

function Awards() {
    return (
        <section className='section awards-section fade-up'>
            <div className='container'>
                <div className='row align-items-center'>
                    <div className='col-lg-6 p-4 p-md-5'>
                        <img 
                            src='media/images/largestBroker.svg' 
                            alt='Largest Broker'
                            className='img-fluid fade-up float-animation' 
                            style={{ animation: 'float 6s ease-in-out infinite' }}
                        />
                    </div>
                    <div className='col-lg-6 p-4 p-md-5 fade-up stagger-1'>
                        <h1 className='fs-2 fw-bold mb-4 awards-title'>
                            Largest stock broker in India
                        </h1>
                        <p className='fs-5 mb-5 awards-desc'>
                            2+ million TradeXpert clients contribute to over 15% of all retail order volumes in India daily by trading and investing in:
                        </p>
                        <div className='row g-4 mb-5'>
                            <div className='col-sm-6'>
                                <ul className='list-unstyled stagger-2'>
                                    <li className='d-flex align-items-center mb-3'>
                                        <i className="fa-solid fa-circle-check me-3" style={{ color: 'var(--accent)', fontSize: '1.2rem' }}></i>
                                        <span className='fs-6 fw-medium awards-feature-text'>Features and Options</span>
                                    </li>
                                    <li className='d-flex align-items-center mb-3'>
                                        <i className="fa-solid fa-circle-check me-3" style={{ color: 'var(--accent)', fontSize: '1.2rem' }}></i>
                                        <span className='fs-6 fw-medium awards-feature-text'>Commodity derivatives</span>
                                    </li>
                                    <li className='d-flex align-items-center mb-3'>
                                        <i className="fa-solid fa-circle-check me-3" style={{ color: 'var(--accent)', fontSize: '1.2rem' }}></i>
                                        <span className='fs-6 fw-medium awards-feature-text'>Currency derivatives</span>
                                    </li>
                                </ul>
                            </div>
                            <div className='col-sm-6'>
                                <ul className='list-unstyled stagger-3'>
                                    <li className='d-flex align-items-center mb-3'>
                                        <i className="fa-solid fa-circle-check me-3" style={{ color: 'var(--accent)', fontSize: '1.2rem' }}></i>
                                        <span className='fs-6 fw-medium awards-feature-text'>Stocks & IPOs</span>
                                    </li>
                                    <li className='d-flex align-items-center mb-3'>
                                        <i className="fa-solid fa-circle-check me-3" style={{ color: 'var(--accent)', fontSize: '1.2rem' }}></i>
                                        <span className='fs-6 fw-medium awards-feature-text'>Direct mutual funds</span>
                                    </li>
                                    <li className='d-flex align-items-center mb-3'>
                                        <i className="fa-solid fa-circle-check me-3" style={{ color: 'var(--accent)', fontSize: '1.2rem' }}></i>
                                        <span className='fs-6 fw-medium awards-feature-text'>Bonds and Govt. Security</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className='mt-4 stagger-4'>
                            <img 
                                src='media/images/pressLogos.png' 
                                alt='Press Logos'
                                className='img-fluid hover-opacity' 
                                style={{ width: "90%", opacity: '0.8', transition: 'opacity 0.3s ease', cursor: 'pointer' }}
                                onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                                onMouseOut={(e) => e.currentTarget.style.opacity = 0.8}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </section>
    );
}

export default Awards;