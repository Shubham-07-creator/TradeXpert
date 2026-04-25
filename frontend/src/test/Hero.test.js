import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";

import Hero from "../landing_page/home/Hero";

describe("Hero Component", () => {
  test("renders heading", () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );

    expect(
      screen.getByText(/Invest in everything/i)
    ).toBeInTheDocument();
  });

  test("renders signup button", () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );

    expect(screen.getByText(/Signup Now/i)).toBeInTheDocument();
  });
});