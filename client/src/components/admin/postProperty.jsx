import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import 'quill-table-better/dist/quill-table-better.css';  // Updated CSS import
import Select from "react-select";
import makeAnimated from "react-select/animated";
import API_BASE_URL from '../../config.js';
import Quill from 'quill';
import QuillTableBetter from 'quill-table-better';
import { jwtDecode } from 'jwt-decode';

const animatedComponents = makeAnimated();

const PostProperty = () => {
  Quill.register('modules/table-better', QuillTableBetter);

  const navigate = useNavigate();

  /* ---------- Form state ---------- */
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
  const [builderName, setBuilderName] = useState('');

  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [amenityOptions, setAmenityOptions] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);

  /* ---------- Custom "Other" Amenity ---------- */
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherAmenityName, setOtherAmenityName] = useState("");

  const [builders, setBuilders] = useState([]);
  const [selectedBuilderId, setSelectedBuilderId] = useState("");

  /* ---------- Media state ---------- */
  const [images, setImages] = useState([]);
  const [extraImageInputs, setExtraImageInputs] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [video, setVideo] = useState(null);

  /* ---------- UI helpers ---------- */
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- Quill editor ---------- */
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
      'table-better': {
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
        bindings: QuillTableBetter.keyboardBindings
      },
    },
    formats: [
      "header", "bold", "italic", "underline",
      "list", "bullet", "link", "align",
      "color", "background", "table",
    ],
  });

  /* ---------- Quill description sync ---------- */
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

  /* ---------- Fetch property types + amenities ---------- */
useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        setAccountType(decoded.account_type);
        if (decoded.account_type === 'builder') {
          // Fetch builder details
          const builderRes = await axios.get(`${API_BASE_URL}/api/builder`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const builder = builderRes.data;
          setBuilders([builder]);
          setSelectedBuilderId(builder.id);
          setBuilderName(builder.name);
          return; // Skip other fetches if builder
        }
      }

      const [typesRes, amenitiesRes, buildersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/properties/types`),
        axios.get(`${API_BASE_URL}/api/properties/amenities`),
        axios.get(`${API_BASE_URL}/api/properties/builders-list`),
      ]);

      // 1. Property Types
      const types = typesRes.data.propertyTypes || [];
      setPropertyTypes(types);
      if (types.length > 0) {
        setFormData((prev) => ({ ...prev, property_type: types[0] }));
      }

      // 2. Amenities (for react-select)
      const amenityOptions = (amenitiesRes.data.amenities || []).map((a) => ({
        value: a.amenity_id,
        label: a.name,
        icon: a.icon,
        isDb: true,
      }));

      // Add "Other" option at the end
      amenityOptions.push({
        value: "OTHER",
        label: "Other …",
        icon: null,
        isDb: false,
      });

      setAmenityOptions(amenityOptions);

      // 3. Builders (for dropdown)
      const buildersList = buildersRes.data.builders || [];
      setBuilders(buildersList);

      // Set default value (first builder) if list is not empty
      if (buildersList.length > 0) {
        setSelectedBuilderId(buildersList[0].id);
      } else {
        setSelectedBuilderId(""); // or null — prevent submit if empty
      }

    } catch (err) {
      console.error("Error fetching form data:", err);
      setError(err.response?.data?.error || "Failed to load required data. Please try again.");
    }
  };

  fetchData();
}, []);

  /* ---------- Input handlers ---------- */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCoverImageChange = (e) => setCoverImage(e.target.files[0]);
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

  /* ---------- Amenity Select Handler ---------- */
  const handleAmenityChange = (selected) => {
    const hasOther = selected.some((opt) => opt.value === "OTHER");
    setShowOtherInput(hasOther);
    setSelectedAmenities(selected.filter((opt) => opt.value !== "OTHER"));
  };

  /* ---------- Form submit ---------- */
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
        setError("Please enter the name of the custom amenity.");
        setIsSubmitting(false);
        return;
      }

      const data = new FormData();

      // Text fields
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));

      // Append builder_id
      data.append('builder_id', selectedBuilderId);

      // Amenities: send array of DB IDs
      selectedAmenities.forEach((opt) => data.append("amenities[]", opt.value));

      // Custom "Other" amenity
      if (showOtherInput && otherAmenityName.trim()) {
        data.append("other_amenity", otherAmenityName.trim());
      }

      // Images
      images.forEach((img) => data.append("images[]", img));
      extraImageInputs.forEach((i) => i.file && data.append("images[]", i.file));

      // Cover & video
      coverImage && data.append("cover_image", coverImage);
      video && data.append("video", video);

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
  /* ---------- Custom React-Select Styles (with icons) ---------- */
  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: 48,
      borderColor: "#d1d5db",
      "&:hover": { borderColor: "#9ca3af" },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#e0e7ff",
      borderRadius: "9999px",
      padding: "2px 8px",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      fontSize: "14px",
      color: "#4f46e5",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#4f46e5",
      ":hover": { backgroundColor: "#c7d2fe", color: "#312e81" },
    }),
  };

  const formatOptionLabel = ({ label, icon }) => (
    <div className="flex items-center space-x-2">
      {icon && <i className={`${icon} text-gray-600`}></i>}
      <span>{label}</span>
    </div>
  );

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-8">
          Post Your Property
        </h2>

        {/* ---------- Messages ---------- */}
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

          {/* ----- Title ----- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>


<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Builder <span className="text-red-500">*</span>
  </label>
  <select
    value={selectedBuilderId}
    onChange={(e) => setSelectedBuilderId(e.target.value)}
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
  >
    <option value="">Select Builder</option>
    {builders.map((b) => (
      <option key={b.id} value={b.id}>
        {b.name}
      </option>
    ))}
  </select>
</div>

          {/* ----- Description (Quill) ----- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <div ref={quillRef} className="bg-white" style={{ minHeight: "150px" }} />
          </div>

          {/* ----- Price ----- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* ----- Location grid ----- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* ----- Sqft ----- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area (sqft)
            </label>
            <input
              type="number"
              name="sqft"
              value={formData.sqft}
              onChange={handleInputChange}
              min="1"
              placeholder="e.g., 2500"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* ----- Property Type ----- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              name="property_type"
              value={formData.property_type}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Builder</label>
                {accountType === 'builder' ? (
                  <input
                    type="text"
                    value={builderName}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                ) : (
                  <select
                    value={selectedBuilderId}
                    onChange={(e) => setSelectedBuilderId(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {builders.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

          {/* ----- AMENITIES: Searchable Multi-Select Dropdown ----- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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

            {/* Custom "Other" Input */}
            {showOtherInput && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Enter custom amenity (e.g., Private Gym)"
                  value={otherAmenityName}
                  onChange={(e) => setOtherAmenityName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            )}

            {selectedAmenities.length > 0 && (
              <p className="mt-2 text-sm text-gray-600 leading-7">
                Selected: {selectedAmenities.length} amenities
              </p>
            )}
          </div>

          {/* ----- Media ----- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Images (max 10)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultipleImagesChange}
              className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {extraImageInputs.map((inp) => (
              <div key={inp.id} className="mt-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleExtraImageChange(inp.id, e.target.files[0])}
                  className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            ))}
            {images.length + extraImageInputs.length < 10 && (
              <button
                type="button"
                onClick={addExtraImageInput}
                className="mt-3 bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 transition text-sm"
              >
                + Add More Images
              </button>
            )}
          </div>

          {/* ----- Submit ----- */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition font-medium disabled:bg-gray-400"
            >
              {isSubmitting ? "Submitting…" : "Post Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostProperty;