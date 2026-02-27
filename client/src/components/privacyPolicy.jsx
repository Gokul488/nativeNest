import React from "react";
import { motion } from "framer-motion";
import Header from "./header";
import Footer from "./footer";

const PrivacyPolicy = () => {
  const policies = [
    {
      title: "1. Information Collection",
      content:
        "We collect information you provide when registering, listing properties, or contacting support, including name, email, phone number, and usage data.",
    },
    {
      title: "2. Use of Information",
      content:
        "Your data is used to provide and improve our services, send transactional notifications, personalize your experience, and communicate with you.",
    },
    {
      title: "3. Data Sharing",
      content:
        "We do not sell your personal data. Information may be shared with trusted partners only to facilitate transactions, improve services, or comply with legal obligations.",
    },
    {
      title: "4. Security",
      content:
        "We implement industry-standard security measures to protect your information from unauthorized access, alteration, or disclosure.",
    },
    {
      title: "5. Cookies",
      content:
        "NativeNest uses cookies to enhance user experience, analyze traffic, and personalize content. You can disable cookies in your browser, but some features may not function properly.",
    },
    {
      title: "6. Your Rights",
      content:
        "You have the right to access, update, or delete your personal information. Contact us at privacy@nativenest.com.",
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
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how NativeNest collects, uses, and protects your information.
          </p>
        </motion.section>

        {/* Policy Content */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-12 shadow-lg border border-gray-100"
        >
          <div className="space-y-8">
            {policies.map((policy, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-[#011936] mb-3">
                  {policy.title}
                </h2>
                <p className="text-gray-700 leading-7">
                  {policy.content.split("privacy@nativenest.com")[0]}
                  {policy.content.includes("privacy@nativenest.com") && (
                    <>
                      <a
                        href="mailto:privacy@nativenest.com"
                        className="text-[#2e6171] font-medium hover:underline"
                      >
                        privacy@nativenest.com
                      </a>
                      {policy.content.split("privacy@nativenest.com")[1] || "."}
                    </>
                  )}
                </p>
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
            Last updated: <span className="font-medium text-[#2e6171]">November 2025</span>
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
                Questions About Privacy?
              </h2>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-95">
                We’re here to help. Reach out to our support team anytime.
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

export default PrivacyPolicy;