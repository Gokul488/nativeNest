import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "./header";
import Footer from "./footer";

const teamMembers = [
  {
    name: "Jane Doe",
    role: "CEO & Founder",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    bio: "Jane leads NativeNest with a vision to revolutionize real estate, bringing over 15 years of industry experience.",
  },
  {
    name: "John Smith",
    role: "Chief Technology Officer",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    bio: "John drives our tech innovation, ensuring a secure and seamless platform for all users.",
  },
  {
    name: "Emily Johnson",
    role: "Head of Customer Success",
    img: "https://images.unsplash.com/photo-1573496359142-b8d877c828f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    bio: "Emily ensures every user has a smooth experience, from browsing to closing deals.",
  },
];

const AboutUs = () => {
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
            About NativeNest
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We connect dreamers with their perfect homes through a{" "}
            <span className="font-semibold text-[#2e6171]">trusted, secure, and intuitive</span> real estate platform.
          </p>
        </motion.section>

        {/* Our Story */}
        <motion.section
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20 lg:mb-24"
        >
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#011936] mb-6">Our Story</h2>
              <p className="text-gray-600 leading-7">
                Founded in <strong className="text-[#2e6171]">2020</strong>, NativeNest emerged from a simple belief: 
                <em> real estate should be simple, transparent, and joyful</em>.
              </p>
              <p className="text-gray-600 leading-7 mt-4">
                We’ve built a platform where every listing is verified, every transaction is secure, and every user feels empowered.
              </p>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-[#2e6171] to-[#011936] rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition duration-1000"></div>
              <img
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="NativeNest Office"
                className="relative w-full h-64 sm:h-72 md:h-80 object-cover rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </motion.section>

        {/* Vision & Mission */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20 lg:mb-24"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: "fa-eye", title: "Our Vision", text: "To <strong className='text-[#2e6171]'>redefine real estate</strong> by creating a seamless, inclusive, and trustworthy platform." },
              { icon: "fa-bullseye", title: "Our Mission", text: "To deliver a <strong className='text-[#2e6171]'>secure, user-friendly platform</strong> with verified listings and expert support." }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-5">
                  <div className="w-12 h-12 bg-linear-to-br from-[#2e6171] to-[#011936] rounded-full flex items-center justify-center shadow-md">
                    <i className={`fas ${item.icon} text-white text-xl`}></i>
                  </div>
                  <h3 className="text-2xl font-bold text-[#011936] ml-4">{item.title}</h3>
                </div>
                <p className="text-gray-600 leading-7" dangerouslySetInnerHTML={{ __html: item.text }} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Team */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 lg:mb-24"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#011936] mb-12">
            Meet Our <span className="bg-linear-to-r from-[#2e6171] to-[#011936] bg-clip-text text-transparent">Leadership</span>
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -8 }}
                className="group bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100"
              >
                <div className="h-56 sm:h-64 overflow-hidden relative">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-2xl font-bold text-[#011936] mb-1">{member.name}</h3>
                  <p className="text-[#2e6171] font-semibold mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5">Join the NativeNest Community</h2>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-95">
                Whether you're buying, selling, or renting — we make your journey effortless and exciting.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-3 bg-white text-[#2e6171] px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Get Started Today
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

export default AboutUs;