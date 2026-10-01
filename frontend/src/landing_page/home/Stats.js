import React from 'react';
import { Link } from 'react-router-dom';

function Stats() {
    return (
        <section className='section stats-section fade-up'>
            <div className='container p-3'>
                <div className='row align-items-center g-5'>
                    <div className='col-lg-6'>
                        <div className='mb-5 fade-up stagger-1'>
                            <h1 className='fs-2 fw-bold' style={{ color: 'var(--ink)' }}>Trust with confidence</h1>
                            <div style={{ width: '60px', height: '4px', background: 'linear-gradient(135deg, #387ED1 0%, #00D09C 100%)', borderRadius: '2px', marginTop: '15px' }}></div>
                        </div>
                        
                        <div className='row g-4'>
                            <div className='col-sm-6 fade-up stagger-2'>
                                <div className='card h-100 border-0 stat-card' style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s ease', borderTop: '4px solid var(--primary-dark)' }}>
                                    <div className='card-body p-4'>
                                        <div className='mb-3'>
                                            <i className="fa-solid fa-users fs-3" style={{ color: 'var(--primary)' }}></i>
                                        </div>
                                        <h2 className='fs-5 fw-bold' style={{ color: 'var(--ink)' }}>Customer-first always</h2>
                                        <p className='fs-6 mt-3' style={{ color: 'var(--muted)' }}>That's why 1.6+ crore customers trust us with ~ ₹6 lakh crores of equity investments.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className='col-sm-6 fade-up stagger-3'>
                                <div className='card h-100 border-0 stat-card' style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s ease', borderTop: '4px solid var(--accent)' }}>
                                    <div className='card-body p-4'>
                                        <div className='mb-3'>
                                            <i className="fa-solid fa-shield-halved fs-3" style={{ color: 'var(--accent)' }}></i>
                                        </div>
                                        <h2 className='fs-5 fw-bold' style={{ color: 'var(--ink)' }}>No spam or gimmicks</h2>
                                        <p className='fs-6 mt-3' style={{ color: 'var(--muted)' }}>No gimmicks, spam, "gamification", or annoying push notifications. High quality apps.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className='col-sm-6 fade-up stagger-4'>
                                <div className='card h-100 border-0 stat-card' style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s ease', borderTop: '4px solid var(--primary)' }}>
                                    <div className='card-body p-4'>
                                        <div className='mb-3'>
                                            <i className="fa-solid fa-globe fs-3" style={{ color: 'var(--primary)' }}></i>
                                        </div>
                                        <h2 className='fs-5 fw-bold' style={{ color: 'var(--ink)' }}>The TradeXpert universe</h2>
                                        <p className='fs-6 mt-3' style={{ color: 'var(--muted)' }}>Not just an app, but a whole ecosystem. Our investments in 30+ fintech startups offer tailored services.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className='col-sm-6 fade-up stagger-5'>
                                <div className='card h-100 border-0 stat-card' style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s ease', borderTop: '4px solid var(--primary-darker)' }}>
                                    <div className='card-body p-4'>
                                        <div className='mb-3'>
                                            <i className="fa-solid fa-arrow-trend-up fs-3" style={{ color: 'var(--primary-darker)' }}></i>
                                        </div>
                                        <h2 className='fs-5 fw-bold' style={{ color: 'var(--ink)' }}>Do better with money</h2>
                                        <p className='fs-6 mt-3' style={{ color: 'var(--muted)' }}>With initiatives like Nudge and Kill Switch, we actively help you do better with your money.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className='col-lg-6 text-center fade-up stagger-3'>
                        <img 
                            src='media/images/ecosystem.png' 
                            alt='Ecosystem'
                            className='img-fluid mb-5' 
                            style={{ maxWidth: "90%", filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.08))', animation: 'float 8s ease-in-out infinite' }}
                        />
                        <div className='d-flex justify-content-center gap-4 flex-wrap'>
                            <Link to='/products' className='btn btn-outline-primary rounded-pill px-4 py-2 d-inline-flex align-items-center fw-medium' style={{ transition: 'all 0.3s ease' }}>
                                Explore our products <i className="fa-solid fa-arrow-right-long ms-2"></i>
                            </Link>
                            <Link to='/try' className='btn btn-primary rounded-pill px-4 py-2 d-inline-flex align-items-center fw-medium' style={{ backgroundColor: 'var(--primary)', transition: 'all 0.3s ease' }}>
                                Try Kite demo <i className="fa-solid fa-arrow-right-long ms-2"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .stat-card:hover {
                    transform: translateY(-8px);
                    box-shadow: var(--shadow-lg) !important;
                }
            `}</style>
        </section>
    );
}

export default Stats;