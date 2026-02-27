// src/components/EditBlog.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import API_BASE_URL from '../../config.js';

const EditBlog = () => {
  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        [{ align: [] }],
        ['clean'],
        [{ color: [] }, { background: [] }],
        ['table'],
      ],
      'better-table': true,
    },
    formats: ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link', 'align', 'color', 'background', 'table'],
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) navigate('/login');
          throw new Error('Failed to fetch blog');
        }

        const data = await response.json();
        setTitle(data.blog.title);
        setContent(data.blog.content);
        if (data.blog.image) setPreviewUrl(data.blog.image);

        if (quill && data.blog.content) {
          quill.clipboard.dangerouslyPasteHTML(data.blog.content);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchBlog();
  }, [id, quill, navigate]);

  useEffect(() => {
    if (quill) {
      quill.on('text-change', () => {
        setContent(quill.root.innerHTML);
      });
    }
  }, [quill]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size exceeds 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(file);
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!title.trim() || !content || content === '<p><br></p>') {
      setError('Title and content are required');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) navigate('/login');
        throw new Error('Failed to update blog');
      }

      setSuccess('Blog updated successfully!');
      setTimeout(() => navigate('/admin-dashboard/manage-blogs'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Edit Blog</h2>
        <Link to="/admin-dashboard/manage-blogs" className="text-teal-600 hover:underline">
          ← Back to Blogs
        </Link>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-200">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <div ref={quillRef} className="min-h-[400px] border border-gray-300 rounded-lg overflow-hidden" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image (Max 10MB)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-teal-50 file:text-teal-700"
          />
          {previewUrl && (
            <div className="mt-4">
              <img src={previewUrl} alt="Preview" className="w-full max-h-96 object-contain rounded-lg shadow-md border" />
            </div>
          )}
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-medium px-8 py-4 rounded-lg transition transform hover:scale-105 disabled:scale-100 shadow-lg"
          >
            {isSubmitting ? 'Updating...' : 'Update Blog'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBlog;