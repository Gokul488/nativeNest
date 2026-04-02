import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => {
  const [totalAmount, setTotalAmount] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");

  const calculateMonthlyPayment = () => {
    if (!totalAmount || !loanTerm || parseFloat(loanTerm) === 0) return 0;
    const principal = totalAmount - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const payments = loanTerm * 12;
    
    if (monthlyRate === 0) return (principal / payments).toFixed(2);
    
    const x = Math.pow(1 + monthlyRate, payments);
    const payment = (principal * x * monthlyRate) / (x - 1);
    return isFinite(payment) ? payment.toFixed(2) : 0;
  };

  const quickLinks = [
    { to: "/privacy-policy", label: "Privacy Policy" },
    { to: "/terms-and-conditions", label: "Terms & Conditions" },
    { to: "/faq's", label: "FAQ" },
    { to: "/buy", label: "Buy Properties" },
    { to: "/blog", label: "Blog" },
  ];

  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=436+Serangoon+Road,+Singapore";

  return (
    <footer className="relative bg-[#011936] text-white overflow-hidden" aria-labelledby="footer-heading">
      {/* CSS to hide number input spinners */}
      <style dangerouslySetInnerHTML={{ __html: `
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}} />

      <h2 id="footer-heading" className="sr-only">Footer</h2>

      {/* Background Orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#2e6171]/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#2e6171]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            aria-labelledby="brand-heading"
          >
            <h3 id="brand-heading" className="text-2xl font-bold mb-4">NativeNest</h3>
            <p className="text-gray-300 text-sm leading-7">
              Your trusted platform for buying, selling, and renting properties. We ensure secure transactions, verified listings, and seamless navigation.
            </p>
          </motion.section>

          {/* Mortgage Calculator */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            aria-labelledby="calculator-heading"
          >
            <h3 id="calculator-heading" className="text-xl font-bold mb-5">Mortgage Calculator</h3>
            <div className="space-y-3 text-sm">
              {[
                { placeholder: "Total Amount (₹)", value: totalAmount, set: setTotalAmount },
                { placeholder: "Down Payment (₹)", value: downPayment, set: setDownPayment },
                { placeholder: "Interest Rate (%)", value: interestRate, set: setInterestRate },
                { placeholder: "Loan Term (Years)", value: loanTerm, set: setLoanTerm },
              ].map((input, i) => (
        <div key={i} className="relative group">
          <input
            type="text"
            placeholder={input.placeholder}
            value={
              input.value === "" ? "" :
              input.placeholder.includes("Rate")
                ? `${input.value}%`
                : input.placeholder.includes("Term")
                ? `${input.value} Years`
                : input.placeholder.includes("Amount") || input.placeholder.includes("Payment")
                ? `₹ ${Number(input.value.toString().replace(/₹|,/g, "")).toLocaleString("en-IN")}`
                : input.value
            }
            onChange={(e) => {
              let val = e.target.value;
              if (input.placeholder.includes("Rate")) {
                val = val.replace(/%/g, "");
              } else if (input.placeholder.includes("Term")) {
                val = val.replace(/Years| /g, "");
              } else if (input.placeholder.includes("Amount") || input.placeholder.includes("Payment")) {
                val = val.replace(/₹|,| /g, "");
              }
              
              if (val === "" || !isNaN(parseFloat(val))) {
                input.set(val);
              }
            }}
            className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/50 transition pr-10 text-sm"
            aria-label={input.placeholder}
          />
                  {input.value && (
                    <button
                      onClick={() => input.set("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  )}
                </div>
              ))}
              <output className="block text-lg font-semibold text-white bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                Monthly: ₹{calculateMonthlyPayment()}
              </output>
            </div>
          </motion.section>

          {/* Navigation & Account */}
          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            aria-labelledby="links-heading"
          >
            <h3 id="links-heading" className="text-xl font-bold mb-5">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-white transition-colors duration-300 text-sm block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* Contact & Social */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
            aria-labelledby="contact-heading"
          >
            <div>
              <h3 id="contact-heading" className="text-xl font-bold mb-5">Contact Us</h3>
              <address className="not-italic text-sm text-gray-300 space-y-3">
                <a
                  href="mailto:support@nativenest.com"
                  className="flex items-center gap-2 hover:text-white transition"
                  aria-label="Email us at support@nativenest.com"
                >
                  <i className="fas fa-envelope text-green-400"></i>
                  support@nativenest.com
                </a>
                <a
                  href="tel:+11234567890"
                  className="flex items-center gap-2 hover:text-white transition"
                  aria-label="Call us at +1 123 456 7890"
                >
                  <i className="fas fa-phone text-blue-400"></i>
                  +1 123 456 7890
                </a>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition"
                  aria-label="View on Google Maps: 436 Serangoon Road, Singapore"
                >
                  <i className="fas fa-map-marker-alt text-red-400"></i>
                  436 Serangoon Road, Singapore
                </a>
              </address>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-4">Follow Us</h4>
              <div className="flex space-x-4 text-2xl">
                <a
                  href="https://wa.me/11234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="text-gray-300 hover:text-green-400 transition"
                >
                  <i className="fab fa-whatsapp"></i>
                </a>
                <a
                  href="https://instagram.com/nativenest"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-gray-300 hover:text-pink-400 transition"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="https://facebook.com/nativenest"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-gray-300 hover:text-blue-400 transition"
                >
                  <i className="fab fa-facebook"></i>
                </a>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-400"
          role="contentinfo"
        >
          © {new Date().getFullYear()} NativeNest. All rights reserved.
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;