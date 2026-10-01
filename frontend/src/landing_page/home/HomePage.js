import React, { useEffect } from "react";
import Hero from "./Hero";
import Awards from "./Awards";
import Stats from "./Stats";
import Pricing from "./Pricing";
import Education from "./Education";
import OpenAccount from "../OpenAccount";
import Calculators from "../calculators/Calculators";
import FAQAccordion from "../support/FAQAccordion";

function HomePage() {
  // Logout detection & cleanup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const logout = params.get("logout");

    if (logout) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Clean URL
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
      <Calculators />
      <Education />
      <FAQAccordion />
      <OpenAccount />
    </>
  );
}

export default HomePage;