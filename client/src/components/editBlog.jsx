import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import API_BASE_URL from '../config.js';   // ← one level up// Properly imported

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
      table: false,
      'better-table': {
        operationMenu: {
          items: {
            insertColumnRight: { text: 'Insert Column Right' },
            insertColumnLeft: { text: 'Insert Column Left' },
            insertRowUp: { text: 'Insert Row Above' },
            insertRowDown: { text: 'Insert Row Below' },
            mergeCells: { text: 'Merge Cells' },
            unmergeCells: { text: 'Unmerge Cells' },
            deleteColumn: { text: 'Delete Column' },
            deleteRow: { text: 'Delete Row' },
            deleteTable: { text: 'Delete Table' },
          },
        },
      },
    },
    formats: [
      'header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link', 'align', 'color', 'background', 'table',
    ],
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
          throw new Error('No token found. Please log in.');
        }

        const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login');
            throw new Error('Unauthorized. Please log in again.');
          }
          throw new Error('Failed to fetch blog');
        }

        const data = await response.json();
        setTitle(data.blog.title);
        setContent(data.blog.content);
        if (data.blog.image) {
          setPreviewUrl(data.blog.image);
        }
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
      quill.getModule('toolbar').addHandler('table', () => {
        quill.getModule('better-table').insertTable(2, 2);
      });
      quill.on('text-change', () => {
        setContent(quill.root.innerHTML);
      });
    }
  }, [quill]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size exceeds 10MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(file);
        setPreviewUrl(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!title || !content || content === '<p><br></p>') {
      setError('Blog title and content are required');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        throw new Error('No token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          // Note: Do NOT set Content-Type here when using FormData
          // The browser will automatically set it with the correct boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          navigate('/login');
          throw new Error('Unauthorized. Please log in again.');
        }
        throw new Error(data.error || 'Failed to update blog');
      }

      setSuccess('Blog updated successfully!');
      setTimeout(() => navigate('/seller-dashboard/view-blogs'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-8">
          Edit Blog
        </h2>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-200">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <div ref={quillRef} className="bg-white h-96" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image (Max 10MB)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {previewUrl && (
              <div className="mt-4">
                <img src={previewUrl} alt="Blog Image Preview" className="w-full h-48 object-contain rounded-md border" />
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBlog;