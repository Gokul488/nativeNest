// src/components/AddBlog.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Quill from 'quill';
import QuillTableBetter from 'quill-table-better';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import 'quill-table-better/dist/quill-table-better.css';
import { FaArrowLeft, FaBlog, FaImage, FaExclamationTriangle, FaCheckCircle, FaCloudUploadAlt } from 'react-icons/fa';
import API_BASE_URL from '../../config.js';

const AddBlog = () => {
  // Register the new table module
  Quill.register('modules/table-better', QuillTableBetter);

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
      'table-better': {
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
      keyboard: {
        bindings: QuillTableBetter.keyboardBindings
      },
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

  useEffect(() => {
    if (quill) {
      quill.getModule('toolbar').addHandler('table', () => {
        quill.getModule('table-better').insertTable(2, 2);
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
      setError('Title and content are required');
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      const response = await fetch(`${API_BASE_URL}/api/blogs`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create blog');
      }

      setSuccess('Blog published successfully!');
      setTimeout(() => navigate('/admin-dashboard/manage-blogs'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px] font-sans">
      {/* Top Header - Consistent with EventParticipants/BuilderInterests */}
      <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/admin-dashboard/manage-blogs"
            className="p-2 hover:bg-white rounded-full transition shadow-sm border border-gray-200 text-gray-600"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight leading-tight">Add New Blog</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5">Content Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
            <FaBlog /> Blog Editor
          </span>
        </div>
      </div>

      <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3 animate-headShake">
            <FaExclamationTriangle /> {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex items-center gap-3">
            <FaCheckCircle /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title Input Section */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              Blog Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-lg font-semibold text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
              placeholder="e.g. 10 Tips for First-Time Home Buyers"
              required
            />
          </div>

          {/* Content Editor Section */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              Blog Content <span className="text-red-500">*</span>
            </label>
            <div className="rounded-xl border border-gray-300 overflow-hidden shadow-sm focus-within:ring-4 focus-within:ring-teal-500/10 focus-within:border-teal-500 transition-all">
              <div ref={quillRef} className="min-h-[450px] text-gray-700" />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              Featured Image
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="relative group">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-teal-50 hover:border-teal-400 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaCloudUploadAlt className="text-4xl text-gray-400 group-hover:text-teal-500 mb-3 transition-colors" />
                    <p className="mb-1 text-sm text-gray-600 font-semibold">Click to upload</p>
                    <p className="text-xs text-gray-400">PNG, JPG or WebP (Max 5MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>

              {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 h-48 group">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold uppercase tracking-widest"><FaImage className="inline mr-2" /> Preview Mode</span>
                  </div>
                </div>
              ) : (
                <div className="h-48 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm italic bg-gray-50/50">
                  No image selected for preview
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex items-center gap-3 bg-linear-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold px-10 py-4 rounded-xl transition-all shadow-lg hover:shadow-teal-200 transform hover:-translate-y-1 active:translate-y-0 disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <span>Publish Blog Post</span>
                  <FaCheckCircle className="group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlog;