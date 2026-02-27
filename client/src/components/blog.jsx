import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "./header";
import Footer from "./footer";
import API_BASE_URL from '../config.js';   // ← one level up   // Now used properly!

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/blogs/featured`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const payload = await res.json();
        const raw = Array.isArray(payload)
          ? payload
          : payload.blogs || payload.data || [];

        const normalized = raw.map((b, idx) => {
          const id = b.id ?? b._id ?? `tmp-${idx}`;
          if (!b.id && !b._id) console.warn("Blog without id → using fallback", b);

          return {
            id,
            title: b.title ?? "Untitled",
            excerpt: b.excerpt ?? "Click to read the full article.",
            image: b.image ?? null,
            created_at: b.created_at ?? null,
          };
        });

        setBlogs(normalized);
      } catch (e) {
        console.error("Error fetching blogs:", e);
        setError(e.message || "Failed to load blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);   // Dependency array is fine — API_BASE_URL is a constant

  // Memoized skeleton cards
  const skeletonCards = useMemo(() => {
    return [0, 1, 2].map((i) => (
      <motion.div
        key={`sk-${i}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md border border-gray-100 animate-pulse"
      >
        <div className="h-56 sm:h-64 bg-linear-to-br from-gray-200 to-gray-300" />
        <div className="p-6 space-y-3">
          <div className="h-7 bg-gray-200 rounded w-11/12" />
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
          </div>
          <div className="h-5 bg-gray-200 rounded w-28 mt-4" />
        </div>
      </motion.div>
    ));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white flex flex-col">
        <Header />
        <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skeletonCards}
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white flex flex-col">
        <Header />
        <div className="grow flex items-center justify-center pt-24 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md w-full text-center"
          >
            Failed to load blogs
            {error}
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white overflow-hidden">
      <Header />

      {/* Decorative Orbs */}
      <div className="fixed inset-0 -z-10 hidden lg:block pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-[#2e6171] to-[#011936] rounded-full blur-3xl opacity-10 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-tr from-[#2e6171]/70 to-[#011936]/70 rounded-full blur-3xl opacity-10 animate-pulse animation-delay-2000" />
      </div>

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-[#011936] mb-6">
            Our Blogs
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore expert insights, market trends, and tips for your real estate journey.
          </p>
        </motion.section>

        {/* Blog Grid */}
        {blogs.length > 0 ? (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {blogs.map((blog, i) => (
              <BlogCard key={blog.id} blog={blog} index={i} />
            ))}
          </motion.section>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-600 text-lg py-12"
          >
            No blogs available at the moment.
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

// Reusable Blog Card
const BlogCard = React.memo(({ blog, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      whileHover={{ y: -8 }}
      className="group bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100"
    >
      {/* Image */}
      {blog.image ? (
        <div className="relative h-56 sm:h-64 overflow-hidden">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = "";
              e.currentTarget.parentElement.innerHTML = `
                <div class="h-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <i class="fas fa-image text-4xl text-gray-400"></i>
                </div>`;
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      ) : (
        <div className="h-56 sm:h-64 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <i className="fas fa-image text-4xl text-gray-400" />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#011936] mb-2 line-clamp-2">
          {blog.title}
        </h2>

        <p className="text-sm text-[#2e6171] font-medium mb-3 flex items-center gap-2">
          {blog.created_at
            ? new Date(blog.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Date unavailable"}
        </p>

        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{blog.excerpt}</p>

        <Link
          to={`/blog/${blog.id}`}
          className="inline-flex items-center gap-2 text-[#2e6171] font-semibold hover:text-[#011936] transition-colors duration-300"
        >
          Read More
          <i className="fas fa-arrow-right text-sm group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-[#2e6171]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
});

export default Blog;