import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ViewBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in.');
        }
        const response = await fetch('https://nativenest-backend.onrender.com/api/blogs', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login');
            throw new Error('Unauthorized. Please log in again.');
          }
          throw new Error('Failed to fetch blogs');
        }

        const data = await response.json();
        setBlogs(data.blogs || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchBlogs();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }
      const response = await fetch(`https://nativenest-backend.onrender.com/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          throw new Error('Unauthorized. Please log in again.');
        }
        throw new Error('Failed to delete blog');
      }

      setBlogs(blogs.filter((blog) => blog.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">View Blogs</h2>
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">S.No</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog, index) => (
              <tr key={blog.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700 border-b">{index + 1}</td>
                <td className="px-4 py-3 text-sm text-gray-700 border-b">
                  <Link
                    to={`/seller-dashboard/edit-blog/${blog.id}`}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {blog.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 border-b">
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="px-3 py-1 rounded transition-transform duration-200 hover:scale-110"
                  >
                    <span className="material-symbols-outlined text-red-700">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {blogs.length === 0 && !error && <p className="text-center text-gray-600 leading-7">No blogs found</p>}
    </div>
  );
};

export default ViewBlogs;