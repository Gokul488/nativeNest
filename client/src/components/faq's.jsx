import React from "react";
import { motion } from "framer-motion";
import Header from "./header";
import Footer from "./footer";
import { Link } from "react-router-dom";

const FAQ = () => {
  const faqSections = [
    {
      title: "Questions for Buyers",
      faqs: [
        {
          question: "How do I search for properties on NativeNest?",
          answer:
            "Use the search bar on our homepage to filter properties by location, price range, and property type. You can also use advanced filters like number of bedrooms or amenities to narrow down your options.",
        },
        {
          question: "Are the listings on NativeNest verified?",
          answer:
            "Yes, all listings undergo a verification process to ensure accuracy and authenticity. We work closely with sellers to provide reliable information and photos.",
        },
        {
          question: "Can I schedule a property tour through NativeNest?",
          answer:
            "Absolutely! Once you find a property you’re interested in, you can contact the seller or agent directly through our platform to schedule a tour.",
        },
        {
          question: "What are the payment options for purchasing a property?",
          answer:
            "NativeNest connects you with sellers and agents who can guide you through payment options, including mortgages, direct payments, or financing plans. We recommend consulting a financial advisor for detailed guidance.",
        },
      ],
    },
    {
      title: "Questions for Sellers",
      faqs: [
        {
          question: "How do I list my property on NativeNest?",
          answer:
            "To list your property, create an account, go to the 'Sell' section, and follow the steps to upload details, photos, and pricing. Our team will review your listing for verification before it goes live.",
        },
        {
          question: "Are there any fees for listing a property?",
          answer:
            "NativeNest offers free basic listings, with optional premium plans for enhanced visibility. Visit our pricing page for more details.",
        },
        {
          question: "How long does it take for my listing to be approved?",
          answer:
            "Most listings are reviewed and approved within 24-48 hours, provided all required information and documents are submitted correctly.",
        },
        {
          question: "Can I edit or remove my listing after it’s live?",
          answer:
            "Yes, you can edit or remove your listing at any time from your seller dashboard. Changes may require re-verification to ensure accuracy.",
        },
      ],
    },
    {
      title: "General Questions",
      faqs: [
        {
          question: "Is NativeNest secure for transactions?",
          answer:
            "We prioritize security with encrypted data transmission and verified user accounts. However, we recommend conducting due diligence and working with trusted professionals for final transactions.",
        },
        {
          question: "How can I contact NativeNest support?",
          answer: (
            <>
              You can reach our support team via the Contact Us page or by emailing{" "}
              <a
                href="mailto:support@nativenest.com"
                className="text-[#2e6171] font-medium hover:underline"
              >
                support@nativenest.com
              </a>
              . We’re available 24/7 to assist you.
            </>
          ),
        },
        {
          question: "Do you offer services for renters?",
          answer:
            "Yes, NativeNest provides a dedicated section for rentals. You can browse verified rental listings and connect with landlords directly through the platform.",
        },
      ],
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
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about buying, selling, and renting properties on NativeNest.
          </p>
        </motion.section>

        {/* FAQ Sections */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20 lg:mb-24"
        >
          <div className="space-y-16">
            {faqSections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-lg"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-[#011936] mb-8">
                  {section.title}
                </h2>
                <div className="space-y-8">
                  {section.faqs.map((faq, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="border-b border-gray-200 pb-6 last:border-none"
                    >
                      <h3 className="text-xl font-semibold text-[#011936] mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 leading-7">
                        {typeof faq.answer === "string" ? faq.answer : faq.answer}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Last Updated */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center text-sm text-gray-500"
          >
            Last updated:{" "}
            <span className="font-medium text-[#2e6171]">November 2025</span>
          </motion.p>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative bg-linear-to-r from-[#2e6171] to-[#011936] rounded-2xl p-8 sm:p-12 text-center text-white shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5">
                Still Have Questions?
              </h2>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-95">
                Our support team is here to help you with any queries about buying, selling, or renting on NativeNest.
              </p>
              <Link
                to="/contactUs"
                className="inline-flex items-center gap-3 bg-white text-[#2e6171] px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Contact Us
                <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;