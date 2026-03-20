// src/components/PostProperty.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import "quill-table-better/dist/quill-table-better.css";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import API_BASE_URL from "../../config.js";
import { QuillTableBetter } from "../../utils/registerQuillModules";
import { jwtDecode } from "jwt-decode";
import {
  ArrowLeft,
  Home,
  Image,
  Video,
  AlertTriangle,
  CheckCircle2,
  CloudUpload,
  Building2,
  Images,
  Plus,
  Trash2,
  PlusCircle,
  Loader2,
  MapPin,
  Tag,
  Layers,
  Sparkles,
} from "lucide-react";

const animatedComponents = makeAnimated();

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOCK_LABELS = ["Block A", "Block B", "Block C", "Block D", "Block E", "Others"];
const APT_TYPE_OPTIONS = ["1BHK", "2BHK", "3BHK", "4BHK", "Penthouse", "Studio", "Others"];

const DEFAULT_CONFIG = () => ({
  id: Date.now() + Math.random(),
  apartment_type: "1BHK",
  isCustomType: false,
  price: "",
  sqft: "",
  quantity: "1",
});

const DEFAULT_BLOCK = () => ({
  block_name: "Block A",
  isCustomBlock: false,
  configs: [DEFAULT_CONFIG()],
});

// ─── Component ────────────────────────────────────────────────────────────────

const PostProperty = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = location.pathname.includes("/admin-dashboard");
  const backPath = isAdmin
    ? "/admin-dashboard/manage-properties"
    : "/builder-dashboard/my-properties";

  // ── Form state ────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    property_type: "",
    sqft: "",
    quantity: "1",
  });

  const [accountType, setAccountType] = useState(null);
  const [builderName, setBuilderName] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [amenityOptions, setAmenityOptions] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [blocks, setBlocks] = useState([DEFAULT_BLOCK()]);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherAmenityName, setOtherAmenityName] = useState("");
  const [builders, setBuilders] = useState([]);
  const [selectedBuilderId, setSelectedBuilderId] = useState("");

  // ── Media state ───────────────────────────────────────────────
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [video, setVideo] = useState(null);
  const [images, setImages] = useState([]);
  const [extraImageInputs, setExtraImageInputs] = useState([]);

  // ── UI state ──────────────────────────────────────────────────
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState("cover");

  // ── Quill setup ───────────────────────────────────────────────
  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        [{ align: [] }],
        ["clean"],
        [{ color: [] }, { background: [] }],
        ["table"],
      ],
      "table-better": {
        operationMenu: {
          items: {
            insertColumnRight: { text: "Insert Column Right" },
            insertColumnLeft: { text: "Insert Column Left" },
            insertRowUp: { text: "Insert Row Above" },
            insertRowDown: { text: "Insert Row Below" },
            mergeCells: { text: "Merge Cells" },
            unmergeCells: { text: "Unmerge Cells" },
            deleteColumn: { text: "Delete Column" },
            deleteRow: { text: "Delete Row" },
            deleteTable: { text: "Delete Table" },
          },
        },
      },
      keyboard: { bindings: QuillTableBetter.keyboardBindings },
    },
    formats: ["header", "bold", "italic", "underline", "list", "link", "align", "color", "background", "table"],
  });

  useEffect(() => {
    if (quill) {
      quill.getModule("toolbar").addHandler("table", () => {
        quill.getModule("table-better").insertTable(2, 2);
      });
      quill.on("text-change", () => {
        setFormData((prev) => ({ ...prev, description: quill.root.innerHTML }));
      });
    }
  }, [quill]);

  // ── Fetch initial data ────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        const decoded = jwtDecode(token);
        setAccountType(decoded.account_type);

        if (decoded.account_type === "builder") {
          const builderRes = await axios.get(`${API_BASE_URL}/api/builder`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const builder = builderRes.data;
          setBuilders([builder]);
          setSelectedBuilderId(builder.id);
          setBuilderName(builder.name);
        }

        const [typesRes, amenitiesRes, buildersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/properties/types`),
          axios.get(`${API_BASE_URL}/api/properties/amenities`),
          axios.get(`${API_BASE_URL}/api/properties/builders-list`),
        ]);

        const types = typesRes.data.propertyTypes || [];
        setPropertyTypes(types);
        if (types.length > 0) setFormData((prev) => ({ ...prev, property_type: types[0] }));

        const amenityOpts = (amenitiesRes.data.amenities || []).map((a) => ({
          value: a.amenity_id, label: a.name, icon: a.icon, isDb: true,
        }));
        amenityOpts.push({ value: "OTHER", label: "Other …", icon: null, isDb: false });
        setAmenityOptions(amenityOpts);

        const buildersList = buildersRes.data.builders || [];
        setBuilders(buildersList);
        if (buildersList.length > 0 && decoded.account_type !== "builder") {
          setSelectedBuilderId(buildersList[0].id);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Failed to load form data");
      }
    };
    fetchData();
  }, [navigate]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Cover image size exceeds 5MB limit"); return; }
    setCoverImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleVideoChange = (e) => setVideo(e.target.files[0]);
  const handleMultipleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files].slice(0, 10));
  };
  const handleExtraImageChange = (id, file) =>
    setExtraImageInputs((prev) => prev.map((i) => (i.id === id ? { ...i, file } : i)));
  const addExtraImageInput = () => {
    if (images.length + extraImageInputs.length < 10)
      setExtraImageInputs((prev) => [...prev, { id: Date.now(), file: null }]);
  };

  const handleAmenityChange = (selected) => {
    const hasOther = selected.some((opt) => opt.value === "OTHER");
    setShowOtherInput(hasOther);
    setSelectedAmenities(selected.filter((opt) => opt.value !== "OTHER"));
  };

  // ── Block helpers ─────────────────────────────────────────────
  const updateBlock = (idx, field, value) =>
    setBlocks((prev) => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b));

  const addBlock = () => {
    const nextLabel = BLOCK_LABELS[blocks.length] || `Block ${String.fromCharCode(65 + blocks.length)}`;
    setBlocks((prev) => [...prev, { ...DEFAULT_BLOCK(), block_name: nextLabel }]);
  };

  const removeBlock = (idx) =>
    setBlocks((prev) => prev.filter((_, i) => i !== idx));

  // ── Config helpers (per block) ────────────────────────────────
  const addConfig = (blockIdx) =>
    setBlocks((prev) => prev.map((b, i) =>
      i === blockIdx ? { ...b, configs: [...b.configs, DEFAULT_CONFIG()] } : b
    ));

  const removeConfig = (blockIdx, configId) =>
    setBlocks((prev) => prev.map((b, i) =>
      i === blockIdx
        ? { ...b, configs: b.configs.filter((c) => c.id !== configId) }
        : b
    ));

  const updateConfig = (blockIdx, configId, field, value) =>
    setBlocks((prev) => prev.map((b, i) =>
      i === blockIdx
        ? { ...b, configs: b.configs.map((c) => c.id === configId ? { ...c, [field]: value } : c) }
        : b
    ));

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!formData.description || formData.description === "<p><br></p>") {
      setError("Description is required");
      setIsSubmitting(false);
      return;
    }

    if (formData.property_type === "Apartment") {
      if (blocks.length === 0) {
        setError("Please add at least one block configuration.");
        setIsSubmitting(false);
        return;
      }
      for (const block of blocks) {
        if (!block.block_name?.trim()) {
          setError("A block has no name. Please select or enter a block name.");
          setIsSubmitting(false);
          return;
        }
        if (!block.configs || block.configs.length === 0) {
          setError(`Block "${block.block_name}" needs at least one apartment configuration.`);
          setIsSubmitting(false);
          return;
        }
        for (const config of block.configs) {
          if (!config.apartment_type?.trim()) {
            setError(`Block "${block.block_name}" has a config missing an apartment type.`);
            setIsSubmitting(false);
            return;
          }
          if (!config.price || isNaN(config.price) || Number(config.price) <= 0) {
            setError(`Block "${block.block_name}" › ${config.apartment_type} needs a valid price.`);
            setIsSubmitting(false);
            return;
          }
          if (!config.sqft || isNaN(config.sqft) || Number(config.sqft) <= 0) {
            setError(`Block "${block.block_name}" › ${config.apartment_type} needs a valid sqft.`);
            setIsSubmitting(false);
            return;
          }
        }
      }
    }

    const variants = formData.property_type === "Apartment"
      ? blocks.flatMap((block) =>
        block.configs.map((config) => ({
          apartment_type: config.apartment_type.trim(),
          block_name: block.block_name.trim(),
          price: Number(config.price),
          sqft: Number(config.sqft),
          quantity: Number(config.quantity) || 1,
        }))
      )
      : [];

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    data.append("builder_id", selectedBuilderId);
    selectedAmenities.forEach((opt) => data.append("amenities[]", opt.value));
    if (showOtherInput && otherAmenityName.trim()) data.append("other_amenity", otherAmenityName.trim());
    images.forEach((img) => data.append("images[]", img));
    extraImageInputs.forEach((i) => i.file && data.append("images[]", i.file));
    if (coverImage) data.append("cover_image", coverImage);
    if (video) data.append("video", video);
    data.append("variants", JSON.stringify(variants));

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/properties`, data, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setSuccess("Property posted successfully!");
      setTimeout(() => navigate(backPath), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post property");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Select styles — updated to match indigo/slate theme ──────
  const customStyles = {
    control: (p) => ({
      ...p,
      minHeight: 40,
      borderColor: "#e2e8f0",
      borderRadius: "0.75rem",
      backgroundColor: "#f8fafc",
      boxShadow: "none",
      "&:hover": { borderColor: "#6366f1" },
    }),
    multiValue: (p) => ({
      ...p,
      backgroundColor: "#eef2ff",
      borderRadius: "9999px",
      padding: "2px 8px",
      border: "1px solid #c7d2fe",
    }),
    multiValueLabel: (p) => ({ ...p, color: "#4338ca", fontSize: "12px", fontWeight: 600 }),
    multiValueRemove: (p) => ({ ...p, color: "#4338ca", ":hover": { backgroundColor: "#c7d2fe", color: "#312e81" } }),
    placeholder: (p) => ({ ...p, color: "#94a3b8", fontSize: "14px" }),
    option: (p, state) => ({
      ...p,
      backgroundColor: state.isSelected ? "#6366f1" : state.isFocused ? "#eef2ff" : "white",
      color: state.isSelected ? "white" : "#334155",
      fontSize: "14px",
    }),
    menuPortal: (p) => ({ ...p, zIndex: 9999 }),
    menu: (p) => ({
      ...p,
      borderRadius: "0.75rem",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 24px rgba(15,23,42,0.10)",
      overflow: "hidden",
    }),
  };

  const formatOptionLabel = ({ label, icon }) => (
    <div className="flex items-center space-x-2">
      {icon && <i className={`${icon} text-slate-500`} />}
      <span>{label}</span>
    </div>
  );

  // ── Shared input class ────────────────────────────────────────
  const inputCls =
    "w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400";

  const labelCls = "block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

  // ── Render ────────────────────────────────────────────────────
  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]"
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      {/* ── Header ── */}
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Left: icon + title */}
        <div className="flex items-center gap-3">
          <Link
            to={backPath}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>

            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Inventory Management System
            </p>
          </div>
        </div>

        {/* Right: badge */}
        <span className="bg-sky-50 text-sky-600 text-xs font-bold px-3 py-1.5 rounded-full border border-sky-100 flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5" /> Property Editor
        </span>
      </div>

      {/* ── Body ── */}
      <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full">

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Section: Basic Info ──────────────────────────── */}
          <SectionCard icon={<Tag className="w-4 h-4 text-sky-500" />} title="Basic Information">

            {/* Builder */}
            <div>
              <label className={labelCls}>Builder <span className="text-red-400">*</span></label>
              {accountType === "builder" ? (
                <input
                  type="text"
                  value={builderName}
                  readOnly
                  className={`${inputCls} bg-slate-100 cursor-not-allowed`}
                />
              ) : (
                <select
                  value={selectedBuilderId}
                  onChange={(e) => setSelectedBuilderId(e.target.value)}
                  required
                  className={inputCls}
                >
                  <option value="">Select Builder</option>
                  {builders.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Title */}
            <div>
              <label className={labelCls}>Property Title <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g. 3BHK Luxury Apartment in Anna Nagar"
                className={inputCls}
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description <span className="text-red-400">*</span></label>
              <div className="rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all bg-slate-50">
                <div ref={quillRef} className="min-h-[260px] text-slate-700" />
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className={labelCls}>Property Type <span className="text-red-400">*</span></label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleInputChange}
                required
                className={inputCls}
              >
                {propertyTypes.length
                  ? propertyTypes.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))
                  : <option>Loading…</option>}
              </select>
            </div>

            {/* Price / Sqft / Qty — non-apartment */}
            {formData.property_type !== "Apartment" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelCls}>Price (₹) <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                    placeholder="e.g. 7500000"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Area (sqft)</label>
                  <input
                    type="number"
                    name="sqft"
                    value={formData.sqft}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="e.g. 1850"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    className={inputCls}
                  />
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── Section: Apartment Block Configurations ──────── */}
          {formData.property_type === "Apartment" && (
            <SectionCard
              icon={<Layers className="w-4 h-4 text-indigo-500" />}
              title="Apartment Block Configurations"
              action={
                <button
                  type="button"
                  onClick={addBlock}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 px-3.5 py-2 rounded-xl transition-all duration-200 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Block
                </button>
              }
            >
              <div className="space-y-4">
                {blocks.map((block, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:border-indigo-200 transition-colors"
                  >
                    {/* Block name header */}
                    <div className="flex items-center justify-between bg-indigo-50 px-5 py-3 gap-3 border-b border-indigo-100">
                      <div className="flex items-center gap-3">
                        {!block.isCustomBlock ? (
                          <select
                            value={block.block_name}
                            onChange={(e) => {
                              if (e.target.value === "Others") {
                                updateBlock(idx, "isCustomBlock", true);
                                updateBlock(idx, "block_name", "");
                              } else {
                                updateBlock(idx, "block_name", e.target.value);
                              }
                            }}
                            className="px-3 py-1.5 border border-indigo-200 rounded-lg text-sm font-bold bg-white text-indigo-800 focus:ring-2 focus:ring-indigo-400 outline-none"
                          >
                            {BLOCK_LABELS.map((b) => <option key={b} value={b}>{b}</option>)}
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              autoFocus
                              placeholder="e.g. Tower 1"
                              value={block.block_name}
                              onChange={(e) => updateBlock(idx, "block_name", e.target.value)}
                              className="px-3 py-1.5 border border-indigo-300 rounded-lg text-sm font-bold text-indigo-800 focus:ring-2 focus:ring-indigo-400 outline-none w-32 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => { updateBlock(idx, "isCustomBlock", false); updateBlock(idx, "block_name", "Block A"); }}
                              className="text-xs text-indigo-500 hover:text-indigo-700 font-bold underline whitespace-nowrap"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => addConfig(idx)}
                          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg bg-white transition-all"
                        >
                          <Plus className="w-3 h-3" /> Add Type
                        </button>
                        {blocks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBlock(idx)}
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-bold transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> Block
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Config rows */}
                    <div className="divide-y divide-slate-50">
                      {block.configs.map((config, cIdx) => (
                        <div key={config.id} className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                              Configuration {cIdx + 1}
                            </span>
                            {block.configs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeConfig(idx, config.id)}
                                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-semibold transition-colors"
                              >
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Apartment Type */}
                            <div>
                              <label className={labelCls}>Apt. Type</label>
                              {!config.isCustomType ? (
                                <select
                                  value={config.apartment_type}
                                  onChange={(e) => {
                                    if (e.target.value === "Others") {
                                      updateConfig(idx, config.id, "isCustomType", true);
                                      updateConfig(idx, config.id, "apartment_type", "");
                                    } else {
                                      updateConfig(idx, config.id, "apartment_type", e.target.value);
                                    }
                                  }}
                                  className={inputCls}
                                >
                                  {APT_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                                </select>
                              ) : (
                                <div className="flex gap-1">
                                  <input
                                    type="text"
                                    autoFocus
                                    placeholder="e.g. 5BHK"
                                    value={config.apartment_type}
                                    onChange={(e) => updateConfig(idx, config.id, "apartment_type", e.target.value)}
                                    className={inputCls}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateConfig(idx, config.id, "isCustomType", false);
                                      updateConfig(idx, config.id, "apartment_type", "1BHK");
                                    }}
                                    className="text-xs text-indigo-500 hover:text-indigo-700 px-1 font-bold"
                                  >
                                    ↩
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Price */}
                            <div>
                              <label className={labelCls}>Price (₹)</label>
                              <input
                                type="number"
                                min="1"
                                placeholder="e.g. 5000000"
                                value={config.price}
                                onChange={(e) => updateConfig(idx, config.id, "price", e.target.value)}
                                className={inputCls}
                              />
                            </div>

                            {/* Sqft */}
                            <div>
                              <label className={labelCls}>Sqft</label>
                              <input
                                type="number"
                                min="1"
                                placeholder="e.g. 1200"
                                value={config.sqft}
                                onChange={(e) => updateConfig(idx, config.id, "sqft", e.target.value)}
                                className={inputCls}
                              />
                            </div>

                            {/* Qty */}
                            <div>
                              <label className={labelCls}>Qty</label>
                              <input
                                type="number"
                                min="1"
                                value={config.quantity}
                                onChange={(e) => updateConfig(idx, config.id, "quantity", e.target.value)}
                                className={inputCls}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* ── Section: Location ────────────────────────────── */}
          <SectionCard icon={<MapPin className="w-4 h-4 text-sky-500" />} title="Location Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Address <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 42, North Street"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>City <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Chennai"
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelCls}>State <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Tamil Nadu"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Country <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. India"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Pincode <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 625001"
                  className={inputCls}
                />
              </div>
            </div>
          </SectionCard>

          {/* ── Section: Amenities ───────────────────────────── */}
          <SectionCard icon={<Sparkles className="w-4 h-4 text-indigo-500" />} title="Amenities">
            <Select
              closeMenuOnSelect={false}
              components={animatedComponents}
              isMulti
              options={amenityOptions}
              value={selectedAmenities}
              onChange={handleAmenityChange}
              formatOptionLabel={formatOptionLabel}
              placeholder="Search and select amenities..."
              noOptionsMessage={() => "No amenities found"}
              styles={customStyles}
              className="basic-multi-select"
              classNamePrefix="select"
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
            {showOtherInput && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Enter custom amenity (e.g. Private Theatre)"
                  value={otherAmenityName}
                  onChange={(e) => setOtherAmenityName(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
            )}
            {selectedAmenities.length > 0 && (
              <p className="text-xs text-slate-400 font-semibold mt-2">
                {selectedAmenities.length} amenities selected
              </p>
            )}
          </SectionCard>

          {/* ── Section: Media ───────────────────────────────── */}
          <SectionCard icon={<Images className="w-4 h-4 text-sky-500" />} title="Media">
            {/* Tab bar */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-5">
              {[
                { key: "cover", icon: <Image className="w-4 h-4" />, label: "Cover Image" },
                { key: "gallery", icon: <Images className="w-4 h-4" />, label: `Gallery (${images.length + extraImageInputs.length}/10)` },
                { key: "video", icon: <Video className="w-4 h-4" />, label: "Video Tour" },
              ].map(({ key, icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveMediaTab(key)}
                  className={`inline-flex items-center gap-1.5 py-2 px-4 rounded-[10px] text-sm font-semibold transition-all duration-200 ${
                    activeMediaTab === key
                      ? "bg-white text-sky-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">

              {/* Cover Image */}
              {activeMediaTab === "cover" && (
                <div className="space-y-4">
                  <p className={labelCls}>
                    Cover Image <span className="text-[10px] font-normal normal-case text-slate-400">(recommended: 1200×800)</span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-white hover:bg-sky-50 hover:border-sky-400 transition-all group">
                      <CloudUpload className="w-12 h-12 text-slate-300 group-hover:text-sky-400 mb-3 transition-colors" />
                      <p className="text-sm font-semibold text-slate-600 group-hover:text-sky-600">Click to upload cover image</p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP · Max 5MB</p>
                      <input type="file" accept="image/*" className="hidden" onChange={handleCoverImageChange} />
                    </label>
                    {coverPreview ? (
                      <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200 h-56 group">
                        <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <Image className="w-4 h-4" /> Cover Preview
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-56 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-sm italic bg-white/50">
                        No cover image selected
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {activeMediaTab === "gallery" && (
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <p className={labelCls}>
                      Additional Images <span className="text-[10px] font-normal normal-case text-slate-400">(max 10)</span>
                    </p>
                    {images.length + extraImageInputs.length < 10 && (
                      <button
                        type="button"
                        onClick={addExtraImageInput}
                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 px-3.5 py-2 rounded-xl transition-all shadow-sm"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Add Image
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-white hover:bg-sky-50 hover:border-sky-300 transition-all group aspect-square">
                      <CloudUpload className="w-8 h-8 text-slate-300 group-hover:text-sky-400 mb-1.5 transition-colors" />
                      <p className="text-xs font-semibold text-slate-500 text-center">Upload images</p>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleMultipleImagesChange} />
                    </label>
                    {images.map((file, i) => (
                      <div key={i} className="h-28 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group aspect-square">
                        <img src={URL.createObjectURL(file)} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium px-2 text-center">
                          {file.name}
                        </div>
                      </div>
                    ))}
                    {extraImageInputs.map((inp) => (
                      <div key={inp.id} className="h-28 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 relative aspect-square bg-white">
                        {inp.file ? (
                          <img src={URL.createObjectURL(inp.file)} alt="Extra preview" className="w-full h-full object-cover" />
                        ) : (
                          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-sky-50/50 transition">
                            <Image className="w-6 h-6 text-slate-300 mb-1.5" />
                            <span className="text-xs text-slate-500 text-center px-1 font-medium">Choose image</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleExtraImageChange(inp.id, e.target.files[0])} />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video */}
              {activeMediaTab === "video" && (
                <div className="space-y-4">
                  <p className={labelCls}>
                    Video Tour <span className="text-[10px] font-normal normal-case text-slate-400">(optional)</span>
                  </p>
                  <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-white hover:bg-sky-50 hover:border-sky-300 transition-all group">
                    <div className="flex flex-col items-center justify-center">
                      <Video className="w-10 h-10 text-slate-300 group-hover:text-sky-400 mb-2 transition-colors" />
                      <p className="text-sm font-semibold text-slate-600">Upload video (MP4 recommended)</p>
                      <p className="text-xs text-slate-400 mt-1">Max size ~50MB suggested</p>
                    </div>
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                  </label>
                  {video && (
                    <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 flex items-center gap-3">
                      <Video className="w-4 h-4 text-sky-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-sky-700">Selected video</p>
                        <p className="text-sm text-slate-600 mt-0.5">{video.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── Submit ───────────────────────────────────────── */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2.5 px-8 py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-[0_4px_12px_rgba(14,165,233,0.3)] hover:shadow-[0_6px_18px_rgba(14,165,233,0.4)] active:scale-[0.98] disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Posting…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Post Property</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

// ─── Section Card sub-component ───────────────────────────────────────────────
const SectionCard = ({ icon, title, action, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">{title}</h3>
      </div>
      {action && <div>{action}</div>}
    </div>
    <div className="p-6 space-y-5">
      {children}
    </div>
  </div>
);

export default PostProperty;