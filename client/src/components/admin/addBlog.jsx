// src/components/AddBlog.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import 'quill-table-better/dist/quill-table-better.css';
import { QuillTableBetter } from '../../utils/registerQuillModules';
import API_BASE_URL from '../../config.js';
import {
  ArrowLeft, Newspaper, Image, AlertTriangle,
  CheckCircle2, CloudUpload, Loader2, Type, FileText,
} from 'lucide-react';

// ─── Shared style constants (mirrors postProperty / editProperty) ─────────────
const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400';
const labelCls = 'block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1';

// ─── Section component ────────────────────────────────────────────────────────
const Section = ({ icon, title, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">{title}</span>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
const AddBlog = () => {
  const navigate = useNavigate();

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
      keyboard: { bindings: QuillTableBetter.keyboardBindings },
    },
    formats: ['header', 'bold', 'italic', 'underline', 'list', 'link', 'align', 'color', 'background', 'table'],
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (quill) {
      quill.getModule('toolbar').addHandler('table', () => {
        quill.getModule('table-better').insertTable(2, 2);
      });
      quill.on('text-change', () => setContent(quill.root.innerHTML));
    }
  }, [quill]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image size exceeds 5MB limit'); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setImage(file); setPreviewUrl(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setIsSubmitting(true);

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col" style={{ fontFamily: '"Inter", sans-serif' }}>

      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link
            to="/admin-dashboard/manage-blogs"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Newspaper className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">Add New Blog</h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Content Management System</p>
          </div>
        </div>
        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
          <Newspaper className="w-3 h-3" /> Blog Editor
        </span>
      </div>

      {/* ── Body ── */}
      <div className="p-5 max-w-5xl mx-auto w-full">

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 px-3 py-2.5 rounded-lg border border-red-100 flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-emerald-50 text-emerald-600 px-3 py-2.5 rounded-lg border border-emerald-100 flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />{success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Blog Details ── */}
          <Section icon={<Type className="w-3.5 h-3.5 text-sky-500" />} title="Blog Details">
            <div>
              <label className={labelCls}>Blog Title <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputCls}
                placeholder="e.g. 10 Tips for First-Time Home Buyers"
                required
              />
            </div>
          </Section>

          {/* ── Content ── */}
          <div className="border-t border-slate-100" />
          <Section icon={<FileText className="w-3.5 h-3.5 text-indigo-500" />} title="Blog Content">
            <div>
              <div className="rounded-lg border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all bg-slate-50">
                <div ref={quillRef} className="min-h-[280px] text-slate-700" />
              </div>
            </div>
          </Section>

          {/* ── Featured Image ── */}
          <div className="border-t border-slate-100" />
          <Section icon={<Image className="w-3.5 h-3.5 text-sky-500" />} title="Featured Image">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-white hover:bg-sky-50 hover:border-sky-400 transition-all group">
                <CloudUpload className="w-8 h-8 text-slate-300 group-hover:text-sky-400 mb-2 transition-colors" />
                <p className="text-xs font-semibold text-slate-600 group-hover:text-sky-600">Click to upload image</p>
                <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP · Max 5MB</p>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>

              {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200 h-36 group">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Image className="w-3.5 h-3.5" /> Preview
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-36 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xs italic bg-white/50">
                  No image selected
                </div>
              )}
            </div>
          </Section>

          {/* ── Submit ── */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white rounded-lg text-sm font-bold transition-all duration-200 shadow-[0_4px_12px_rgba(14,165,233,0.25)] active:scale-[0.98] disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Publishing…</span></>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /><span>Publish Blog Post</span></>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddBlog;