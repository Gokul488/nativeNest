import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Quill from 'quill';
import QuillBetterTable from 'quill-better-table';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import 'quill-better-table/dist/quill-better-table.css';

const AddBlog = () => {
  Quill.register('modules/better-table', QuillBetterTable, true);

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
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size exceeds 5MB limit');
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

  if (!title.trim() || !content.trim() || content === '<p><br></p>') {
    setError('Blog title and content are required');
    setIsSubmitting(false);
    return;
  }

  // Retrieve token from localStorage (or wherever you store it after login)
  const token = localStorage.getItem('token'); // Adjust key if needed

  if (!token) {
    setError('You must be logged in to create a blog');
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
    const response = await fetch('http://localhost:5000/api/blogs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // Critical: Send token here
      },
      body: formData,
      // Do NOT set 'Content-Type' — let browser set it with proper boundary for FormData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create blog');
    }

    setSuccess('Blog created successfully!');
    setTimeout(() => navigate('/seller-dashboard/view-blogs'), 2000);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8 space-y-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center">
          Add New Blog
        </h2>
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <div ref={quillRef} className="bg-white min-h-[300px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image (Max 5MB)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {previewUrl && (
              <img src={previewUrl} alt="Blog Preview" className="mt-4 w-full h-48 object-contain rounded-md" />
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Add Blog"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBlog;