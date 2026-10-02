import React from "react";
import Hero from "./Hero";
import Awards from "./Awards";
import Stats from "./Stats";
import Pricing from "./Pricing";
import Education from "./Education";
import OpenAccount from "../OpenAccount";
import Calculators from "../calculators/Calculators";
import FAQAccordion from "../support/FAQAccordion";

function HomePage() {
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