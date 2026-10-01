import React, { useState } from "react";

const FAQS = [
  {
    category: "Account",
    q: "How fast is account opening on TradeXpert?",
    a: "Account opening is 100% digital, paperless, and takes less than 5 minutes. You can sign up using your email and mobile number, verify your details, and start practicing with ₹1,00,000 virtual balance immediately.",
  },
  {
    category: "Charges",
    q: "What are the brokerage charges on TradeXpert?",
    a: "Equity Delivery investments are ₹0 (Completely Free!). For Intraday and F&O trading, TradeXpert charges a flat ₹20 per executed order or 0.03% (whichever is lower), with no hidden maintenance fees.",
  },
  {
    category: "Trading",
    q: "How does the virtual trading simulator work?",
    a: "Every new user receives ₹1,00,000 in virtual trading capital. The prices are simulated based on real Indian stock market movements (NIFTY 50 and top NSE stocks) with live order book execution, profit & loss calculation, and real-time portfolio tracking.",
  },
  {
    category: "Security",
    q: "Is my personal data and trading information secure?",
    a: "Yes! TradeXpert employs 256-bit SSL encryption, bcrypt password hashing, one-time authenticated code token exchange, and protected API endpoints with JSON Web Tokens (JWT) and rate-limiting safeguards.",
  },
  {
    category: "Trading",
    q: "Can I access both Delivery and Intraday orders?",
    a: "Absolutely. You can place Delivery (CNC) orders that become part of your long-term Holdings, or Intraday orders under Positions, complete with weighted-average buying prices and real-time realized P&L calculations.",
  },
  {
    category: "Account",
    q: "Can I reset or add more virtual funds to my account?",
    a: "Yes! From your Dashboard's 'Funds' section, you can add or withdraw virtual funds at any time with a single click to test different capital sizes and risk management strategies.",
  },
];

const CATEGORIES = ["All", "Account", "Trading", "Charges", "Security"];

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);
  const [selectedCat, setSelectedCat] = useState("All");

  const filteredFaqs =
    selectedCat === "All"
      ? FAQS
      : FAQS.filter((f) => f.category === selectedCat);

  return (
    <div className="container py-5" id="faq">
      <div className="text-center mb-5 fade-up">
        <span className="badge rounded-pill px-3 py-2 mb-2" style={{ background: "var(--primary-light)", color: "var(--primary)", fontWeight: "700" }}>
          GOT QUESTIONS?
        </span>
        <h2 className="fw-bold" style={{ color: "var(--ink)" }}>
          Frequently Asked Questions
        </h2>
        <p className="text-muted" style={{ maxWidth: "600px", margin: "0 auto" }}>
          Everything you need to know about TradeXpert platform, virtual trading, and account features.
        </p>

        {/* Category Pills */}
        <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn btn-sm ${selectedCat === cat ? "btn-primary" : "btn-outline-secondary"}`}
              style={{ borderRadius: "20px", padding: "6px 16px", fontWeight: "600" }}
              onClick={() => {
                setSelectedCat(cat);
                setOpenIndex(null);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="faq-accordion fade-up">
        {filteredFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div className={`faq-item ${isOpen ? "open" : ""}`} key={index}>
              <button
                type="button"
                className="faq-question"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>{faq.q}</span>
                <span className="faq-icon">
                  <i className="fa-solid fa-chevron-down"></i>
                </span>
              </button>

              {isOpen && <div className="faq-answer">{faq.a}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FAQAccordion;
