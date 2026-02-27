// src/components/PostProperty.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import "quill-table-better/dist/quill-table-better.css";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import API_BASE_URL from "../../config.js";
import Quill from "quill";
import QuillTableBetter from "quill-table-better";
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
} from "react-icons/fa";

const animatedComponents = makeAnimated();

const PostProperty = () => {
  Quill.register("modules/table-better", QuillTableBetter);

  const navigate = useNavigate();

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
  });

  const [accountType, setAccountType] = useState(null);
  const [builderName, setBuilderName] = useState("");

  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [amenityOptions, setAmenityOptions] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);

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
      keyboard: {
        bindings: QuillTableBetter.keyboardBindings,
      },
    },
    formats: [
      "header",
      "bold",
      "italic",
      "underline",
      "list",
      "bullet",
      "link",
      "align",
      "color",
      "background",
      "table",
    ],
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
        if (!token) {
          navigate("/login");
          return;
        }

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
        if (types.length > 0) {
          setFormData((prev) => ({ ...prev, property_type: types[0] }));
        }

        const amenityOpts = (amenitiesRes.data.amenities || []).map((a) => ({
          value: a.amenity_id,
          label: a.name,
          icon: a.icon,
          isDb: true,
        }));

        amenityOpts.push({
          value: "OTHER",
          label: "Other …",
          icon: null,
          isDb: false,
        });

        setAmenityOptions(amenityOpts);

        const buildersList = buildersRes.data.builders || [];
        setBuilders(buildersList);
        if (buildersList.length > 0 && !decoded.account_type === "builder") {
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
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Cover image size exceeds 5MB limit");
        return;
      }
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => setVideo(e.target.files[0]);

  const handleMultipleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files].slice(0, 10));
  };

  const handleExtraImageChange = (id, file) => {
    setExtraImageInputs((prev) =>
      prev.map((i) => (i.id === id ? { ...i, file } : i))
    );
  };

  const addExtraImageInput = () => {
    if (images.length + extraImageInputs.length < 10) {
      setExtraImageInputs((prev) => [...prev, { id: Date.now(), file: null }]);
    }
  };

  const handleAmenityChange = (selected) => {
    const hasOther = selected.some((opt) => opt.value === "OTHER");
    setShowOtherInput(hasOther);
    setSelectedAmenities(selected.filter((opt) => opt.value !== "OTHER"));
  };

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

    if (showOtherInput && !otherAmenityName.trim()) {
      setError("Please enter the custom amenity name");
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();

    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    data.append("builder_id", selectedBuilderId);

    selectedAmenities.forEach((opt) => data.append("amenities[]", opt.value));
    if (showOtherInput && otherAmenityName.trim()) {
      data.append("other_amenity", otherAmenityName.trim());
    }

    images.forEach((img) => data.append("images[]", img));
    extraImageInputs.forEach((i) => i.file && data.append("images[]", i.file));

    if (coverImage) data.append("cover_image", coverImage);
    if (video) data.append("video", video);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/properties`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Property posted successfully!");
      setTimeout(() => navigate("/admin-dashboard/manage-properties"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post property");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Custom Select Styles ──────────────────────────────────────
  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: 52,
      borderColor: "#d1d5db",
      borderRadius: "0.75rem",
      "&:hover": { borderColor: "#9ca3af" },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#ecfdf5",
      borderRadius: "9999px",
      padding: "2px 8px",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#065f46",
      fontSize: "14px",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#065f46",
      ":hover": { backgroundColor: "#d1fae5", color: "#064e3b" },
    }),
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
      <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/admin-dashboard/manage-properties"
            className="p-2 hover:bg-white rounded-full transition shadow-sm border border-gray-200 text-gray-600"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              Post New Property
            </h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5">
              Property Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
            <FaHome /> Property Editor
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
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              Property Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-lg font-semibold text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
              placeholder="e.g. 3BHK Luxury Apartment in Anna Nagar"
            />
          </div>

          {/* Builder */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              Builder <span className="text-red-500">*</span>
            </label>
            {accountType === "builder" ? (
              <input
                type="text"
                value={builderName}
                readOnly
                className="w-full px-5 py-4 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed text-lg font-semibold text-gray-700"
              />
            ) : (
              <select
                value={selectedBuilderId}
                onChange={(e) => setSelectedBuilderId(e.target.value)}
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-base text-gray-800 bg-white"
              >
                <option value="">Select Builder</option>
                {builders.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description (Quill) */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="rounded-xl border border-gray-300 overflow-hidden shadow-sm focus-within:ring-4 focus-within:ring-teal-500/10 focus-within:border-teal-500 transition-all">
              <div ref={quillRef} className="min-h-[450px] text-gray-700" />
            </div>
          </div>

          {/* Price & Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-lg font-semibold text-gray-800 placeholder:text-gray-400"
                placeholder="e.g. 7500000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                Area (sqft)
              </label>
              <input
                type="number"
                name="sqft"
                value={formData.sqft}
                onChange={handleInputChange}
                min="1"
                placeholder="e.g. 1850"
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-lg font-semibold text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              Property Type <span className="text-red-500">*</span>
            </label>
            <select
              name="property_type"
              value={formData.property_type}
              onChange={handleInputChange}
              required
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-base text-gray-800 bg-white"
            >
              {propertyTypes.length ? (
                propertyTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))
              ) : (
                <option>Loading…</option>
              )}
            </select>
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-base text-gray-800"
                placeholder="e.g. 42, North Street"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-base text-gray-800"
                placeholder="e.g. Chennai"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-base text-gray-800"
                placeholder="e.g. Tamil Nadu"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-base text-gray-800"
                placeholder="e.g. India"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-base text-gray-800"
                placeholder="e.g. 625001"
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              Amenities
            </label>
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
            />

            {showOtherInput && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter custom amenity (e.g. Private Theatre)"
                  value={otherAmenityName}
                  onChange={(e) => setOtherAmenityName(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-base text-gray-800"
                  required
                />
              </div>
            )}

            {selectedAmenities.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {selectedAmenities.length} amenities
              </p>
            )}
          </div>

          {/* Media – Cover Image */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              Cover Image <span className="text-xs font-normal normal-case text-gray-500">(recommended: 1200×800)</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-teal-50 hover:border-teal-400 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaCloudUploadAlt className="text-5xl text-gray-400 group-hover:text-teal-500 mb-4 transition-colors" />
                  <p className="mb-2 text-base font-semibold text-gray-700">Click to upload cover image</p>
                  <p className="text-sm text-gray-500">PNG, JPG, WebP • Max 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverImageChange}
                />
              </label>

              {coverPreview ? (
                <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 h-56 group">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-bold uppercase tracking-wider">
                      <FaImage className="inline mr-2" /> Preview
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-56 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm italic bg-gray-50/50">
                  No cover image selected
                </div>
              )}
            </div>
          </div>

          {/* Video */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              Video Tour <span className="text-xs font-normal normal-case text-gray-500">(optional)</span>
            </label>
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-teal-50 hover:border-teal-400 transition-all group">
              <div className="flex flex-col items-center justify-center">
                <FaVideo className="text-4xl text-gray-400 group-hover:text-teal-500 mb-2 transition-colors" />
                <p className="text-sm font-semibold text-gray-700">Upload video (MP4, max 50MB recommended)</p>
              </div>
              <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
            </label>
            {video && (
              <p className="text-sm text-teal-700 mt-1">Selected: {video.name}</p>
            )}
          </div>

          {/* Additional Images */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Additional Images <span className="text-xs font-normal normal-case text-gray-500">(max 10)</span>
              </label>
              {images.length + extraImageInputs.length < 10 && (
                <button
                  type="button"
                  onClick={addExtraImageInput}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm font-medium flex items-center gap-2"
                >
                  + Add More
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-teal-50 hover:border-teal-400 transition-all group">
                <FaCloudUploadAlt className="text-4xl text-gray-400 group-hover:text-teal-500 mb-3" />
                <p className="text-sm font-semibold text-gray-700">Click to upload</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleMultipleImagesChange}
                />
              </label>

              {images.map((file, idx) => (
                <div
                  key={idx}
                  className="h-40 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    {file.name}
                  </div>
                </div>
              ))}

              {extraImageInputs.map((inp) => (
                <div key={inp.id} className="h-40 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden relative">
                  {inp.file ? (
                    <img
                      src={URL.createObjectURL(inp.file)}
                      alt="Extra preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50/50 transition">
                      <FaImage className="text-3xl text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Choose image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleExtraImageChange(inp.id, e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-8 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex items-center gap-3 bg-linear-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold px-10 py-4 rounded-xl transition-all shadow-lg hover:shadow-teal-200 transform hover:-translate-y-1 active:translate-y-0 disabled:transform-none min-w-60 justify-center"
            >
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