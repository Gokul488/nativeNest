import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from "./header";
import Footer from "./footer";
import parse from 'html-react-parser';
import API_BASE_URL from '../config.js';   // ← one level up  // Now used correctly!

const BlogDetail = () => {
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError('');

        // Using API_BASE_URL from config.js → works locally AND on Render
        const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch blog (HTTP ${response.status})`);
        }

        const data = await response.json();
        setBlog(data.blog || data); // Some backends return { blog }, some return direct object
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError(err.message || "Unable to load this blog");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBlog();
  }, [id]); // Re-fetch if ID changes

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white flex flex-col overflow-hidden">
        <Header />
        <div className="grow flex-center pt-24">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[#2e6171] text-xl font-medium"
          >
            Loading Blog...
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white flex flex-col overflow-hidden">
        <Header />
        <div className="grow flex-center pt-24 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md w-full text-center"
          >
            Failed to load blog
            {error}
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white flex flex-col">
        <Header />
        <div className="grow flex-center pt-24">
          <p className="text-gray-600 text-lg">Blog not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const publishedDate = blog.created_at
    ? new Date(blog.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "Date unavailable";

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white overflow-hidden">
      <Header />

      {/* Desktop Decorative Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden hidden lg:block">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-[#2e6171] to-[#011936] rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-tr from-[#2e6171]/70 to-[#011936]/70 rounded-full blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-[#2e6171] font-semibold hover:text-[#011936] transition-all group"
        >
          Back to Blogs
        </motion.button>

        {/* Blog Article */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
        >
          {/* Hero Image */}
          {blog.image ? (
            <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "";
                  e.currentTarget.parentElement.innerHTML = `
                    <div class="h-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <i class="fas fa-image text-6xl text-gray-400"></i>
                    </div>
                  `;
                }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight drop-shadow-lg">
                  {blog.title}
                </h1>
              </div>
            </div>
          ) : (
            <div className="h-64 sm:h-80 md:h-96 bg-linear-to-br from-gray-100 to-gray-200 flex-center">
              <i className="fas fa-image text-6xl text-gray-400"></i>
            </div>
          )}

          {/* Content */}
          <div className="p-6 sm:p-8 lg:p-10">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-[#2e6171] font-medium flex items-center gap-2 mb-6"
            >
              Published on {publishedDate}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="blog-content prose prose-lg max-w-none text-gray-700 leading-relaxed"
            >
              {parse(blog.content || '<p>No content available.</p>')}
            </motion.div>
          </div>
        </motion.article>

        {/* Explore More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 text-[#2e6171] font-semibold hover:text-[#011936] transition-colors"
          >
            Explore More Blogs
          </button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;