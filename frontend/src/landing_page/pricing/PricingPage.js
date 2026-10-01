import React from "react";
import Hero from "./Hero";
import Brokerage from "./Brokerage";
import OpenAccount from "../OpenAccount";
import Calculators from "../calculators/Calculators";

function PricingPage() {
  return (
    <>
      <Hero />
      <Calculators />
      <Brokerage />
      <OpenAccount />
    </>
  );
}

export default PricingPage;