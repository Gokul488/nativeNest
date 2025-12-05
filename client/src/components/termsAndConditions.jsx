import React from "react";
import { motion } from "framer-motion";
import Header from "./header";
import Footer from "./footer";

const TermsAndConditions = () => {
  const terms = [
    {
      title: "1. User Responsibilities",
      content:
        "You agree to provide accurate and truthful information when listing or searching for properties. You are responsible for maintaining the confidentiality of your account credentials.",
    },
    {
      title: "2. Listings and Transactions",
      content:
        "NativeNest acts as a marketplace platform and is not responsible for the contractual obligations or actions between buyers, sellers, or renters. All transactions are conducted at your own risk.",
    },
    {
      title: "3. Intellectual Property",
      content:
        "All content on NativeNest, including listings, images, and text, is protected by copyright and may not be used without permission.",
    },
    {
      title: "4. Limitation of Liability",
      content:
        "NativeNest shall not be liable for any damages arising out of use or inability to use the platform, including indirect or consequential damages.",
    },
    {
      title: "5. Changes to Terms",
      content:
        "We reserve the right to update these Terms & Conditions at any time. Continued use of the platform constitutes acceptance of any changes.",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white overflow-hidden">
      <Header />

      {/* Animated Background Orbs (Desktop only) */}
      <div className="fixed inset-0 -z-10 overflow-hidden hidden lg:block">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-[#2e6171] to-[#011936] rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-tr from-[#2e6171]/70 to-[#011936]/70 rounded-full blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-[#011936] mb-6">
            Terms & Conditions
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Welcome to NativeNest! These terms govern your use of our platform for buying, selling, or renting properties.
          </p>
        </motion.section>

        {/* Terms Content */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-12 shadow-lg border border-gray-100"
        >
          <div className="space-y-8">
            {terms.map((term, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-[#011936] mb-3">
                  {term.title}
                </h2>
                <p className="text-gray-700 leading-7">{term.content}</p>
              </motion.article>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center text-sm text-gray-500"
          >
            Last updated: <span className="font-medium text-[#2e6171]">August 2025</span>
          </motion.p>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-16 lg:mt-24"
        >
          <div className="relative bg-linear-to-r from-[#2e6171] to-[#011936] rounded-2xl p-8 sm:p-12 text-center text-white shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5">
                Need Help with Terms?
              </h2>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-95">
                Our support team is ready to assist you with any questions.
              </p>
              <a
                href="mailto:support@nativenest.com"
                className="inline-flex items-center gap-3 bg-white text-[#2e6171] px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Contact Support
                <i className="fas fa-arrow-right ml-2"></i>
              </a>
            </div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;