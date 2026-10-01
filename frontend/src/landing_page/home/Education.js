import React from 'react';
import { Link } from 'react-router-dom';

function Education() {
    return (
        <section className='section education-section fade-up'>
            <div className='container'>
                <div className='row align-items-center g-5'>
                    <div className='col-lg-6 order-2 order-lg-1 fade-up stagger-1'>
                        <img 
                            src='media/images/education.svg' 
                            alt='Education'
                            className='img-fluid' 
                            style={{ animation: 'float 7s ease-in-out infinite', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.05))' }}
                        />
                    </div>
                    <div className='col-lg-6 order-1 order-lg-2 fade-up stagger-2'>
                        <h1 className='fs-2 fw-bold mb-4 education-title'>Free and open market education</h1>
                        
                        <div className='mb-5'>
                            <p className='fs-5 mb-4 education-desc' style={{ lineHeight: '1.6' }}>
                                Varsity, the largest online stock market education book in the world covering everything from the basics to advanced trading.
                            </p>
                            <Link to='/varsity' className='btn education-btn rounded-pill px-4 py-2 d-inline-flex align-items-center fw-medium'>
                                Varsity <i className="fa-solid fa-arrow-right-long ms-2"></i>
                            </Link>
                        </div>
                        
                        <div>
                            <p className='fs-5 mb-4 education-desc' style={{ lineHeight: '1.6' }}>
                                TradingQ&A, the most active trading and investment community in India for all your market related queries.
                            </p>
                            <Link to='/trading-qa' className='btn education-btn rounded-pill px-4 py-2 d-inline-flex align-items-center fw-medium'>
                                TradingQ&A <i className="fa-solid fa-arrow-right-long ms-2"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Education;