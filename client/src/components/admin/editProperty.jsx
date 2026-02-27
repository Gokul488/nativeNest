// Modified editProperty.jsx (Design aligned with postProperty.jsx)
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import API_BASE_URL from '../../config.js';
const animatedComponents = makeAnimated();

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [amenityOptions, setAmenityOptions] = useState([]);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherAmenityName, setOtherAmenityName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [sqft, setSqft] = useState("");
  const [builderId, setBuilderId] = useState("");
  const [builderName, setBuilderName] = useState("");
  // Initialize Quill editor
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
      "better-table": {
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
    },
    formats: [
      "header",
      "bold",
      "italic",
      "underline",
      "list", 
      "link",
      "align",
      "color",
      "background",
      "table",
    ],
  });

  // Update description when Quill content changes
  useEffect(() => {
    if (quill) {
      quill.getModule("toolbar").addHandler("table", () => {
        quill.getModule("better-table").insertTable(2, 2);
      });
      quill.on("text-change", () => {
        setDescription(quill.root.innerHTML);
      });
    }
  }, [quill]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/viewproperties/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const prop = response.data;
        setProperty(prop);
        setTitle(prop.title || "");
        setDescription(prop.description || "");
        setPrice(prop.price || "");
        setAddress(prop.address || "");
        setCity(prop.city || "");
        setState(prop.state || "");
        setCountry(prop.country || "");
        setPincode(prop.pincode || "");
        setBuilderId(prop.builder_id || "");
        setBuilderName(prop.builder_name || "");
        setSqft(prop.sqft || "");
        setPropertyType(prop.property_type || "");
        if (quill && prop.description) {
          quill.clipboard.dangerouslyPasteHTML(prop.description);
        }
        if (prop.amenities) {
          setSelectedAmenities(prop.amenities.map(a => ({
            value: a.id,
            label: a.name,
            icon: a.icon,
            isDb: true,
          })));
        }
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch property");
      }
    };

    const fetchPropertyTypes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/properties/types`);
        setPropertyTypes(response.data.propertyTypes);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch property types");
      }
    };

    const fetchAmenities = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/properties/amenities`);
        const options = (response.data.amenities || []).map((a) => ({
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
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch amenities");
      }
    };

    fetchProperty();
    fetchPropertyTypes();
    fetchAmenities();
  }, [id, quill]);

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

    if (!description || description === "<p><br></p>") {
      setError("Description is required");
      setIsSubmitting(false);
      return;
    }

    if (showOtherInput && !otherAmenityName.trim()) {
      setError("Please enter the name of the custom amenity.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("builder_id", builderId);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("address", address);
    formData.append("city", city);
    formData.append("state", state);
    formData.append("country", country);
    formData.append("pincode", pincode);
    formData.append("property_type", propertyType);
    formData.append("sqft", sqft);
    
    if (coverImage) formData.append("cover_image", coverImage);
    if (video) formData.append("video", video);
    images.forEach((image) => formData.append("images[]", image));
    formData.append("amenities", JSON.stringify(selectedAmenities.map((opt) => opt.value)));
    if (showOtherInput && otherAmenityName.trim()) {
      formData.append("other_amenity", otherAmenityName.trim());
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/viewproperties/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("Property updated successfully!");
      setTimeout(() => navigate("/admin-dashboard/manage-properties"), 2000);
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

  if (!property) return <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg">Loading...</div>;

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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-8">
          Edit Property
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

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Builder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Builder Name
            </label>
            <input
              type="text"
              value={builderName}
              onChange={(e) => setBuilderName(e.target.value)} // Allows typing, though ID remains linked
              required
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
              placeholder="e.g., Prestige Group, DLF"
            />
          </div>
          
          {/* Description (Quill) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <div ref={quillRef} className="bg-white" style={{ minHeight: "150px" }} />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
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
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* NEW: Sqft */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area (sqft)
            </label>
            <input
              type="number"
              value={sqft}
              onChange={(e) => setSqft(e.target.value)}
              min="1"
              placeholder="e.g., 2500"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {propertyTypes.length > 0 ? (
                propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))
              ) : (
                <option>Loading property types...</option>
              )}
            </select>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
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

          {/* Current Cover Image */}
          {property.cover_image && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Cover Image</label>
              <img
                src={`data:image/jpeg;base64,${bufferToBase64(property.cover_image)}`}
                alt="Cover"
                className="w-full h-64 object-cover rounded-lg mb-3 shadow-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Update Cover Image</label>
            <input
              type="file"
              onChange={(e) => setCoverImage(e.target.files[0])}
              accept="image/*"
              className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          {/* Current Video */}
          {property.video && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Video</label>
              <video
                src={`data:video/mp4;base64,${bufferToBase64(property.video)}`}
                controls
                className="w-full max-w-md h-64 object-cover rounded-lg mb-3 shadow-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Update Video</label>
            <input
              type="file"
              onChange={(e) => setVideo(e.target.files[0])}
              accept="video/*"
              className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="text-sm text-gray-500 mt-2 leading-7">
              Note: Uploading a new video will replace the existing video.
            </p>
          </div>

          {/* Current Images */}
          {property.images && property.images.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Images</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.images.map((img) => (
                  <img
                    key={img.id}
                    src={`data:image/jpeg;base64,${bufferToBase64(img.image)}`}
                    alt="Property"
                    className="w-full h-40 object-cover rounded-lg shadow-sm"
                  />
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Update Additional Images (max 10)
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files))}
              className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              accept="image/*"
            />
            <p className="text-sm text-gray-500 mt-2 leading-7">
              Note: Uploading new images will replace all existing images.
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium disabled:bg-gray-400"
            >
              {isSubmitting ? "Updating…" : "Update Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;