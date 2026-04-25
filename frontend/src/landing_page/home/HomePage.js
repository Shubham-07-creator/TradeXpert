import React, { useEffect } from 'react';
import Hero from './Hero';
import Awards from './Awards';
import Stats from './Stats';
import Pricing from './Pricing';
import Education from './Education';
import OpenAccount from '../OpenAccount';
import Footer from '../Footer';

function HomePage() {

  // 🔥 LOGOUT DETECT
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const logout = params.get("logout");

    if (logout) {
      localStorage.removeItem("user");

      // URL clean
      window.history.replaceState({}, document.title, "/");

      window.dispatchEvent(new Event("userChanged"));
    }
  }, []);

  return ( 
    <>
      <Hero />
      <Awards />
      <Stats />
      <Pricing />
      <Education />
      <OpenAccount />
      <Footer />
    </>
  );
}

export default HomePage;