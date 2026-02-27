// src/components/EditProperty.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import "quill-table-better/dist/quill-table-better.css";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import API_BASE_URL from "../../config.js";
import Quill from "quill";
import QuillTableBetter from "quill-table-better";
import {
  FaArrowLeft,
  FaHome,
  FaImage,
  FaVideo,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCloudUploadAlt,
} from "react-icons/fa";

const animatedComponents = makeAnimated();

const EditProperty = () => {
  Quill.register("modules/table-better", QuillTableBetter);

  const { id } = useParams();
  const navigate = useNavigate();

  // ── Form state ────────────────────────────────────────────────
  const [property, setProperty] = useState(null);
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
  const [builderId, setBuilderId] = useState("");
  const [builderName, setBuilderName] = useState("");

  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [amenityOptions, setAmenityOptions] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);

  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherAmenityName, setOtherAmenityName] = useState("");

  // ── Media state ───────────────────────────────────────────────
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [video, setVideo] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

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

        // Fetch property
        const propertyRes = await axios.get(`${API_BASE_URL}/api/viewproperties/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const prop = propertyRes.data;
        setProperty(prop);
        setFormData({
          title: prop.title || "",
          description: prop.description || "",
          price: prop.price || "",
          address: prop.address || "",
          city: prop.city || "",
          state: prop.state || "",
          country: prop.country || "",
          pincode: prop.pincode || "",
          property_type: prop.property_type || "",
          sqft: prop.sqft || "",
        });
        setBuilderId(prop.builder_id || "");
        setBuilderName(prop.builder_name || "");
        if (quill && prop.description) {
          quill.clipboard.dangerouslyPasteHTML(prop.description);
        }

        // Fetch property types
        const typesRes = await axios.get(`${API_BASE_URL}/api/properties/types`);
        setPropertyTypes(typesRes.data.propertyTypes || []);

        // Fetch amenities
        const amenitiesRes = await axios.get(`${API_BASE_URL}/api/properties/amenities`);
        const options = (amenitiesRes.data.amenities || []).map((a) => ({
          value: a.amenity_id,
          label: a.name,
          icon: a.icon,
          isDb: true,
        }));
        options.push({
          value: "OTHER",
          label: "Other …",
          icon: null,
          isDb: false,
        });
        setAmenityOptions(options);

        // Set selected amenities
        if (prop.amenities) {
          setSelectedAmenities(
            prop.amenities.map((a) => ({
              value: a.id,
              label: a.name,
              icon: a.icon,
              isDb: true,
            }))
          );
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Failed to load data");
      }
    };

    fetchData();
  }, [id, navigate, quill]);

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
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
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
    data.append("builder_id", builderId);
    selectedAmenities.forEach((opt) => data.append("amenities[]", opt.value));
    if (showOtherInput && otherAmenityName.trim()) {
      data.append("other_amenity", otherAmenityName.trim());
    }
    images.forEach((img) => data.append("images[]", img));
    if (coverImage) data.append("cover_image", coverImage);
    if (video) data.append("video", video);

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/viewproperties/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("Property updated successfully!");
      setTimeout(() => navigate("/admin-dashboard/manage-properties"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const bufferToBase64 = (buffer) => {
    if (!buffer || !buffer.data) return "";
    const binary = buffer.data.reduce((str, byte) => str + String.fromCharCode(byte), "");
    return btoa(binary);
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

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg">
        Loading...
      </div>
    );
  }

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
              Edit Property
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
            <input
              type="text"
              value={builderName}
              readOnly
              className="w-full px-5 py-4 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed text-lg font-semibold text-gray-700"
            />
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
            {property.cover_image && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Cover Image:</p>
                <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 h-56 group">
                  <img
                    src={`data:image/jpeg;base64,${bufferToBase64(property.cover_image)}`}
                    alt="Current cover"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-bold uppercase tracking-wider">
                      <FaImage className="inline mr-2" /> Current
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-teal-50 hover:border-teal-400 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaCloudUploadAlt className="text-5xl text-gray-400 group-hover:text-teal-500 mb-4 transition-colors" />
                  <p className="mb-2 text-base font-semibold text-gray-700">Click to update cover image</p>
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
                  No new cover selected
                </div>
              )}
            </div>
          </div>

          {/* Video */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              Video Tour <span className="text-xs font-normal normal-case text-gray-500">(optional)</span>
            </label>
            {property.video && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Video:</p>
                <video
                  src={`data:video/mp4;base64,${bufferToBase64(property.video)}`}
                  controls
                  className="w-full h-56 object-cover rounded-xl border border-gray-200 shadow-lg"
                />
              </div>
            )}
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-teal-50 hover:border-teal-400 transition-all group">
              <div className="flex flex-col items-center justify-center">
                <FaVideo className="text-4xl text-gray-400 group-hover:text-teal-500 mb-2 transition-colors" />
                <p className="text-sm font-semibold text-gray-700">Update video (MP4, max 50MB recommended)</p>
              </div>
              <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
            </label>
            {video && (
              <p className="text-sm text-teal-700 mt-1">Selected: {video.name}</p>
            )}
          </div>

          {/* Additional Images */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Additional Images <span className="text-xs font-normal normal-case text-gray-500">(max 10)</span>
            </label>
            {property.images && property.images.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {property.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="h-40 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group"
                    >
                      <img
                        src={`data:image/jpeg;base64,${bufferToBase64(img.image)}`}
                        alt={`Current ${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        Current Image
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-500">
                Uploading new images will replace all existing ones.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-teal-50 hover:border-teal-400 transition-all group">
                <FaCloudUploadAlt className="text-4xl text-gray-400 group-hover:text-teal-500 mb-3" />
                <p className="text-sm font-semibold text-gray-700">Click to update images</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleMultipleImagesChange}
                />
              </label>

              {imagePreviews.map((preview, idx) => (
                <div
                  key={idx}
                  className="h-40 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group"
                >
                  <img
                    src={preview}
                    alt={`New Preview ${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    {images[idx].name}
                  </div>
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
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Update Property</span>
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

export default EditProperty;