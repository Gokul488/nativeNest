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
  FaArrowLeft,
  FaHome,
  FaImage,
  FaVideo,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaBuilding,
  FaImages,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

const animatedComponents = makeAnimated();

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOCK_LABELS     = ["Block A", "Block B", "Block C", "Block D", "Block E", "Others"];
const APT_TYPE_OPTIONS = ["1BHK", "2BHK", "3BHK", "4BHK", "Penthouse", "Studio", "Others"];

// Each block maps to one row in property_variants:
//   block_name → block_name column
//   apartment_type → apartment_type column (stores the BHK value)
//   price, sqft, quantity → their respective columns
const DEFAULT_BLOCK = () => ({
  block_name:     "Block A",
  isCustomBlock:  false,
  apartment_type: "1BHK",
  isCustomType:   false,
  price:          "",
  sqft:           "",
  quantity:       "1",
});

// ─── Component ────────────────────────────────────────────────────────────────

const PostProperty = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin  = location.pathname.includes("/admin-dashboard");
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

  const [accountType,       setAccountType]       = useState(null);
  const [builderName,       setBuilderName]        = useState("");
  const [selectedAmenities, setSelectedAmenities]  = useState([]);
  const [amenityOptions,    setAmenityOptions]     = useState([]);
  const [propertyTypes,     setPropertyTypes]      = useState([]);

  // Flat list of blocks — each becomes one property_variants row
  const [blocks, setBlocks] = useState([DEFAULT_BLOCK()]);

  const [showOtherInput,    setShowOtherInput]    = useState(false);
  const [otherAmenityName,  setOtherAmenityName]  = useState("");
  const [builders,          setBuilders]          = useState([]);
  const [selectedBuilderId, setSelectedBuilderId] = useState("");

  // ── Media state ───────────────────────────────────────────────
  const [coverImage,       setCoverImage]       = useState(null);
  const [coverPreview,     setCoverPreview]     = useState(null);
  const [video,            setVideo]            = useState(null);
  const [images,           setImages]           = useState([]);
  const [extraImageInputs, setExtraImageInputs] = useState([]);

  // ── UI state ──────────────────────────────────────────────────
  const [error,          setError]          = useState("");
  const [success,        setSuccess]        = useState("");
  const [isSubmitting,   setIsSubmitting]   = useState(false);
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
            insertColumnLeft:  { text: "Insert Column Left"  },
            insertRowUp:       { text: "Insert Row Above"    },
            insertRowDown:     { text: "Insert Row Below"    },
            mergeCells:        { text: "Merge Cells"         },
            unmergeCells:      { text: "Unmerge Cells"       },
            deleteColumn:      { text: "Delete Column"       },
            deleteRow:         { text: "Delete Row"          },
            deleteTable:       { text: "Delete Table"        },
          },
        },
      },
      keyboard: { bindings: QuillTableBetter.keyboardBindings },
    },
    formats: ["header","bold","italic","underline","list","link","align","color","background","table"],
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

  const handleVideoChange          = (e) => setVideo(e.target.files[0]);
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
        if (!block.apartment_type?.trim()) {
          setError(`Block "${block.block_name}" needs an apartment type (e.g. 2BHK).`);
          setIsSubmitting(false);
          return;
        }
        if (!block.price || isNaN(block.price) || Number(block.price) <= 0) {
          setError(`Block "${block.block_name}" needs a valid price.`);
          setIsSubmitting(false);
          return;
        }
        if (!block.sqft || isNaN(block.sqft) || Number(block.sqft) <= 0) {
          setError(`Block "${block.block_name}" needs a valid sqft.`);
          setIsSubmitting(false);
          return;
        }
      }
    }

    // Each block → one property_variants row
    // apartment_type holds the BHK value (e.g. "2BHK")
    const variants = formData.property_type === "Apartment"
      ? blocks.map((block) => ({
          apartment_type: block.apartment_type.trim(),
          block_name:     block.block_name.trim(),
          price:          Number(block.price),
          sqft:           Number(block.sqft),
          quantity:       Number(block.quantity) || 1,
        }))
      : [];

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    data.append("builder_id", selectedBuilderId);
    selectedAmenities.forEach((opt) => data.append("amenities[]", opt.value));
    if (showOtherInput && otherAmenityName.trim()) data.append("other_amenity", otherAmenityName.trim());
    images.forEach((img) => data.append("images[]", img));
    extraImageInputs.forEach((i) => i.file && data.append("images[]", i.file));
    if (coverImage) data.append("cover_image", coverImage);
    if (video)      data.append("video", video);
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

  // ── Select styles ─────────────────────────────────────────────
  const customStyles = {
    control: (p) => ({ ...p, minHeight: 40, borderColor: "#d1d5db", borderRadius: "0.5rem", "&:hover": { borderColor: "#9ca3af" } }),
    multiValue: (p) => ({ ...p, backgroundColor: "#ecfdf5", borderRadius: "9999px", padding: "2px 8px" }),
    multiValueLabel: (p) => ({ ...p, color: "#065f46", fontSize: "12px" }),
    multiValueRemove: (p) => ({ ...p, color: "#065f46", ":hover": { backgroundColor: "#d1fae5", color: "#064e3b" } }),
  };
  const formatOptionLabel = ({ label, icon }) => (
    <div className="flex items-center space-x-2">
      {icon && <i className={`${icon} text-gray-600`} />}
      <span>{label}</span>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px] font-sans">

      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to={backPath} className="p-2 hover:bg-white rounded-full transition shadow-sm border border-gray-200 text-gray-600">
            <FaArrowLeft />
          </Link>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight leading-tight">Post New Property</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5">Inventory Management System</p>
          </div>
        </div>
        <span className="bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
          <FaHome /> Property Editor
        </span>
      </div>

      <div className="p-4 lg:p-6 max-w-5xl mx-auto w-full">
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3">
            <FaExclamationTriangle /> {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex items-center gap-3">
            <FaCheckCircle /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Builder */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              Builder <span className="text-red-500">*</span>
            </label>
            {accountType === "builder" ? (
              <input type="text" value={builderName} readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-base font-semibold text-gray-700" />
            ) : (
              <select value={selectedBuilderId} onChange={(e) => setSelectedBuilderId(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm text-gray-800 bg-white">
                <option value="">Select Builder</option>
                {builders.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              Property Title <span className="text-red-500">*</span>
            </label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-base font-semibold text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
              placeholder="e.g. 3BHK Luxury Apartment in Anna Nagar" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="rounded-xl border border-gray-300 overflow-hidden shadow-sm focus-within:ring-4 focus-within:ring-teal-500/10 focus-within:border-teal-500 transition-all">
              <div ref={quillRef} className="min-h-[300px] text-gray-700" />
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              Property Type <span className="text-red-500">*</span>
            </label>
            <select name="property_type" value={formData.property_type} onChange={handleInputChange} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm text-gray-800 bg-white">
              {propertyTypes.length
                ? propertyTypes.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)
                : <option>Loading…</option>}
            </select>
          </div>

          {/* Price / Sqft / Qty — non-apartment */}
          {formData.property_type !== "Apartment" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} step="0.01" required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-base font-semibold text-gray-800 placeholder:text-gray-400"
                  placeholder="e.g. 7500000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Area (sqft)</label>
                <input type="number" name="sqft" value={formData.sqft} onChange={handleInputChange} min="1" placeholder="e.g. 1850"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-base font-semibold text-gray-800 placeholder:text-gray-400" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase">Quantity</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} min="1"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" />
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              APARTMENT BLOCK CONFIGURATIONS
              - Blocks are the top level (no outer type wrapper)
              - apartment_type field stores the BHK value
              - Each block = one row in property_variants
          ══════════════════════════════════════════════════ */}
          {formData.property_type === "Apartment" && (
            <div className="space-y-3">

              {/* Section header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wide flex items-center gap-2">
                  <FaBuilding /> Apartment Block Configurations
                </h3>
                <button type="button" onClick={addBlock}
                  className="flex items-center gap-2 text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition font-medium">
                  <FaPlus /> Add Block
                </button>
              </div>

              {/* Block cards */}
              {blocks.map((block, idx) => (
                <div key={idx} className="border border-teal-200 rounded-xl bg-white shadow-sm overflow-hidden">

                  {/* Block name header */}
                  <div className="flex items-center justify-between bg-teal-50 px-4 py-2.5 gap-3">
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
                          className="px-3 py-1.5 border border-teal-300 rounded-lg text-sm font-bold bg-white text-teal-800 focus:ring-2 focus:ring-teal-400 outline-none"
                        >
                          {BLOCK_LABELS.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input type="text" autoFocus placeholder="e.g. Tower 1"
                            value={block.block_name}
                            onChange={(e) => updateBlock(idx, "block_name", e.target.value)}
                            className="px-3 py-1.5 border border-teal-400 rounded-lg text-sm font-bold text-teal-800 focus:ring-2 focus:ring-teal-400 outline-none w-32"
                          />
                          <button type="button"
                            onClick={() => { updateBlock(idx, "isCustomBlock", false); updateBlock(idx, "block_name", "Block A"); }}
                            className="text-xs text-teal-600 underline whitespace-nowrap">
                            Reset
                          </button>
                        </div>
                      )}
                    </div>

                    {blocks.length > 1 && (
                      <button type="button" onClick={() => removeBlock(idx)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold transition">
                        <FaTrash className="text-xs" /> Remove
                      </button>
                    )}
                  </div>

                  {/* Block fields: Apartment Type | Price | Sqft | Qty */}
                  <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">

                    {/* Apartment Type (BHK) */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 uppercase">Apartment Type</label>
                      {!block.isCustomType ? (
                        <select
                          value={block.apartment_type}
                          onChange={(e) => {
                            if (e.target.value === "Others") {
                              updateBlock(idx, "isCustomType", true);
                              updateBlock(idx, "apartment_type", "");
                            } else {
                              updateBlock(idx, "apartment_type", e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-400 outline-none"
                        >
                          {APT_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <div className="flex gap-1">
                          <input type="text" autoFocus placeholder="e.g. 5BHK"
                            value={block.apartment_type}
                            onChange={(e) => updateBlock(idx, "apartment_type", e.target.value)}
                            className="w-full px-3 py-2 border border-teal-400 rounded-lg text-sm focus:ring-2 focus:ring-teal-400 outline-none"
                          />
                          <button type="button"
                            onClick={() => { updateBlock(idx, "isCustomType", false); updateBlock(idx, "apartment_type", "1BHK"); }}
                            className="text-xs text-teal-600 underline whitespace-nowrap px-1">
                            ↩
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 uppercase">Price (₹)</label>
                      <input type="number" min="1" placeholder="e.g. 5000000"
                        value={block.price}
                        onChange={(e) => updateBlock(idx, "price", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-400 outline-none"
                      />
                    </div>

                    {/* Sqft */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 uppercase">Sqft</label>
                      <input type="number" min="1" placeholder="e.g. 1200"
                        value={block.sqft}
                        onChange={(e) => updateBlock(idx, "sqft", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-400 outline-none"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 uppercase">Qty</label>
                      <input type="number" min="1"
                        value={block.quantity}
                        onChange={(e) => updateBlock(idx, "quantity", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-400 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Address <span className="text-red-500">*</span></label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm text-gray-800"
                placeholder="e.g. 42, North Street" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">City <span className="text-red-500">*</span></label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm text-gray-800"
                placeholder="e.g. Chennai" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">State <span className="text-red-500">*</span></label>
              <input type="text" name="state" value={formData.state} onChange={handleInputChange} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm text-gray-800"
                placeholder="e.g. Tamil Nadu" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Country <span className="text-red-500">*</span></label>
              <input type="text" name="country" value={formData.country} onChange={handleInputChange} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm text-gray-800"
                placeholder="e.g. India" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Pincode <span className="text-red-500">*</span></label>
              <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm text-gray-800"
                placeholder="e.g. 625001" />
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">Amenities</label>
            <Select closeMenuOnSelect={false} components={animatedComponents} isMulti
              options={amenityOptions} value={selectedAmenities} onChange={handleAmenityChange}
              formatOptionLabel={formatOptionLabel} placeholder="Search and select amenities..."
              noOptionsMessage={() => "No amenities found"} styles={customStyles}
              className="basic-multi-select" classNamePrefix="select" />
            {showOtherInput && (
              <div className="mt-4">
                <input type="text" placeholder="Enter custom amenity (e.g. Private Theatre)"
                  value={otherAmenityName} onChange={(e) => setOtherAmenityName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm text-gray-800"
                  required />
              </div>
            )}
            {selectedAmenities.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">Selected: {selectedAmenities.length} amenities</p>
            )}
          </div>

          {/* Media Tabs */}
          <div className="space-y-4">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: "cover",   icon: <FaImage  className="mr-2 h-5 w-5" />, label: "Cover Image" },
                  { key: "gallery", icon: <FaImages className="mr-2 h-5 w-5" />, label: `Gallery (${images.length + extraImageInputs.length}/10)` },
                  { key: "video",   icon: <FaVideo  className="mr-2 h-5 w-5" />, label: "Video Tour" },
                ].map(({ key, icon, label }) => (
                  <button key={key} type="button" onClick={() => setActiveMediaTab(key)}
                    className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeMediaTab === key
                        ? "border-teal-500 text-teal-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}>
                    {icon}{label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200">

              {/* Cover Image */}
              {activeMediaTab === "cover" && (
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Cover Image <span className="text-xs font-normal normal-case text-gray-500">(recommended: 1200×800)</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-teal-50 hover:border-teal-400 transition-all group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaCloudUploadAlt className="text-6xl text-gray-400 group-hover:text-teal-500 mb-4 transition-colors" />
                        <p className="mb-2 text-lg font-semibold text-gray-700">Click to upload cover image</p>
                        <p className="text-sm text-gray-500">PNG, JPG, WebP • Max 5MB</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleCoverImageChange} />
                    </label>
                    {coverPreview ? (
                      <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 h-48 group">
                        <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-base font-bold uppercase tracking-wider"><FaImage className="inline mr-2" /> Cover Preview</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-base italic bg-white/50">
                        No cover image selected
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {activeMediaTab === "gallery" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Additional Images <span className="text-xs font-normal normal-case text-gray-500">(max 10)</span>
                    </label>
                    {images.length + extraImageInputs.length < 10 && (
                      <button type="button" onClick={addExtraImageInput}
                        className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm font-medium flex items-center gap-2">
                        + Add Image
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-teal-50 hover:border-teal-400 transition-all group aspect-square">
                      <FaCloudUploadAlt className="text-4xl text-gray-400 group-hover:text-teal-500 mb-2 transition-colors" />
                      <p className="text-xs font-semibold text-gray-700 text-center">Upload images</p>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleMultipleImagesChange} />
                    </label>
                    {images.map((file, i) => (
                      <div key={i} className="h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group aspect-square">
                        <img src={URL.createObjectURL(file)} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium px-2 text-center">
                          {file.name}
                        </div>
                      </div>
                    ))}
                    {extraImageInputs.map((inp) => (
                      <div key={inp.id} className="h-28 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 relative aspect-square">
                        {inp.file ? (
                          <img src={URL.createObjectURL(inp.file)} alt="Extra preview" className="w-full h-full object-cover" />
                        ) : (
                          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50/50 transition">
                            <FaImage className="text-3xl text-gray-400 mb-2" />
                            <span className="text-xs text-gray-600 text-center px-1">Choose image</span>
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
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Video Tour <span className="text-xs font-normal normal-case text-gray-500">(optional)</span>
                  </label>
                  <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-teal-50 hover:border-teal-400 transition-all group">
                    <div className="flex flex-col items-center justify-center">
                      <FaVideo className="text-4xl text-gray-400 group-hover:text-teal-500 mb-2 transition-colors" />
                      <p className="text-base font-semibold text-gray-700">Upload video (MP4 recommended)</p>
                      <p className="text-xs text-gray-500 mt-1">Max size ~50MB suggested</p>
                    </div>
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                  </label>
                  {video && (
                    <div className="bg-teal-50 p-4 rounded-lg text-teal-800">
                      <p className="font-medium">Selected video:</p>
                      <p className="text-sm mt-1">{video.name}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-teal-600 text-white rounded-lg text-base font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-teal-500/20 active:scale-[0.98]">
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <span>Post Property</span>
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

export default PostProperty;