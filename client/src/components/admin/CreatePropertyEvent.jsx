// src/components/CreatePropertyEvent.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import API_BASE_URL from "../../config.js";
import {
  ArrowLeft, CalendarDays, AlertTriangle, CheckCircle2,
  CloudUpload, Image, MapPin, Phone, User, Bell, Search, Loader2,
} from "lucide-react";

// ─── Shared style constants ───────────────────────────────────────────────────
const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400";
const labelCls = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1";

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

// ─── Notification user list ───────────────────────────────────────────────────
const NotifyList = ({ list, selectedIds, searchTerm, onSearch, onToggle, onToggleAll }) => (
  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
    <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white"
        />
      </div>
      <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400">
        <span>{selectedIds.length} selected</span>
        <button type="button" onClick={onToggleAll} className="text-indigo-500 hover:text-indigo-700 transition-colors">
          {selectedIds.length === list.length ? "Deselect All" : "Select All"}
        </button>
      </div>
    </div>
    <div className="max-h-44 overflow-y-auto p-1.5 space-y-0.5">
      {list.map((item) => (
        <div
          key={item.id}
          onClick={() => onToggle(item.id)}
          className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${selectedIds.includes(item.id) ? "bg-indigo-50" : "hover:bg-slate-50"}`}
        >
          <div>
            <p className="text-xs font-bold text-slate-800 leading-none">{item.name}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{item.email}</p>
          </div>
          {selectedIds.includes(item.id) && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
        </div>
      ))}
    </div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
const CreatePropertyEvent = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    event_name: "",
    event_type: "Property Sale Mela",
    event_location: "",
    city: "",
    state: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    description: "",
    contact_name: "",
    contact_phone: "",
    stall_count: 0,
    notify_builders: true,
    notify_buyers: true,
  });

  const [bannerImage, setBannerImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allBuilders, setAllBuilders] = useState([]);
  const [allBuyers, setAllBuyers] = useState([]);
  const [selectedBuilderIds, setSelectedBuilderIds] = useState([]);
  const [selectedBuyerIds, setSelectedBuyerIds] = useState([]);
  const [searchTermBuilders, setSearchTermBuilders] = useState("");
  const [searchTermBuyers, setSearchTermBuyers] = useState("");

  React.useEffect(() => {
    const fetchUsersAndBuilders = async () => {
      try {
        const token = localStorage.getItem("token");
        const [buildersRes, buyersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/builders`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setAllBuilders(buildersRes.data);
        setAllBuyers(buyersRes.data);
      } catch (err) {
        console.error("Failed to fetch users/builders", err);
      }
    };
    fetchUsersAndBuilders();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "stall_count" ? parseInt(value) || 0 : value,
    }));
  };

  const toggleBuilderSelection = (id) => setSelectedBuilderIds((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
  const toggleBuyerSelection = (id) => setSelectedBuyerIds((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image size exceeds 5MB limit"); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setBannerImage(file); setPreviewUrl(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      const data = new FormData();
      for (const key in formData) data.append(key, formData[key]);
      data.append("selected_builders", JSON.stringify(selectedBuilderIds));
      data.append("selected_buyers", JSON.stringify(selectedBuyerIds));
      if (bannerImage) data.append("banner_image", bannerImage);
      await axios.post(`${API_BASE_URL}/api/admin/events`, data, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setSuccess("Event created successfully!");
      setTimeout(() => navigate("/admin-dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBuilders = allBuilders.filter((b) =>
    b.name.toLowerCase().includes(searchTermBuilders.toLowerCase()) || b.email?.toLowerCase().includes(searchTermBuilders.toLowerCase())
  );
  const filteredBuyers = allBuyers.filter((b) =>
    b.name.toLowerCase().includes(searchTermBuyers.toLowerCase()) || b.email?.toLowerCase().includes(searchTermBuyers.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col" style={{ fontFamily: '"Inter", sans-serif' }}>

      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link to="/admin-dashboard" className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all">
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">Create Property Event</h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Event Management System</p>
          </div>
        </div>
        <span className="bg-sky-50 text-sky-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-sky-100 flex items-center gap-1">
          <CalendarDays className="w-3 h-3" /> Event Builder
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

          {/* ── Basic Info ── */}
          <Section icon={<CalendarDays className="w-3.5 h-3.5 text-sky-500" />} title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Event Name <span className="text-red-400">*</span></label>
                <input type="text" name="event_name" value={formData.event_name} onChange={handleChange} required placeholder="e.g. Grand Property Expo 2026" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Event Type</label>
                <select name="event_type" value={formData.event_type} onChange={handleChange} className={inputCls}>
                  <option value="Property Expo">Property Expo</option>
                  <option value="Property Sale Mela">Property Sale Mela</option>
                  <option value="Builder Meet">Builder Meet</option>
                  <option value="Open House">Open House</option>
                </select>
              </div>
            </div>
          </Section>

          {/* ── Location ── */}
          <div className="border-t border-slate-100" />
          <Section icon={<MapPin className="w-3.5 h-3.5 text-sky-500" />} title="Location Details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Venue <span className="text-red-400">*</span></label>
                <input type="text" name="event_location" value={formData.event_location} onChange={handleChange} required placeholder="e.g. Convention Center" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>City <span className="text-red-400">*</span></label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="e.g. Chennai" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>State <span className="text-red-400">*</span></label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} required placeholder="e.g. Tamil Nadu" className={inputCls} />
              </div>
            </div>
          </Section>

          {/* ── Schedule ── */}
          <div className="border-t border-slate-100" />
          <Section icon={<CalendarDays className="w-3.5 h-3.5 text-indigo-500" />} title="Schedule">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={labelCls}>Start Date <span className="text-red-400">*</span></label>
                <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>End Date <span className="text-red-400">*</span></label>
                <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Start Time</label>
                <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>End Time</label>
                <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className={inputCls} />
              </div>
            </div>
          </Section>

          {/* ── Contact & Capacity ── */}
          <div className="border-t border-slate-100" />
          <Section icon={<User className="w-3.5 h-3.5 text-sky-500" />} title="Contact & Capacity">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}><span className="flex items-center gap-1"><User className="w-3 h-3" /> Contact Person</span></label>
                <input type="text" name="contact_name" value={formData.contact_name} onChange={handleChange} placeholder="e.g. Ravi Kumar" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}><span className="flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</span></label>
                <input type="text" name="contact_phone" value={formData.contact_phone} onChange={handleChange} placeholder="e.g. 9876543210" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Stall Count</label>
                <input type="number" name="stall_count" value={formData.stall_count} onChange={handleChange} className={inputCls} />
              </div>
            </div>
          </Section>

          {/* ── Description ── */}
          <div className="border-t border-slate-100" />
          <Section icon={<CalendarDays className="w-3.5 h-3.5 text-indigo-500" />} title="Event Description">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={`${inputCls} resize-none`}
              placeholder="Provide details about highlights, participating builders, etc."
            />
          </Section>

          {/* ── Banner Image ── */}
          <div className="border-t border-slate-100" />
          <Section icon={<Image className="w-3.5 h-3.5 text-sky-500" />} title="Event Banner Image">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-white hover:bg-sky-50 hover:border-sky-400 transition-all group">
                <CloudUpload className="w-8 h-8 text-slate-300 group-hover:text-sky-400 mb-2 transition-colors" />
                <p className="text-xs font-semibold text-slate-600 group-hover:text-sky-600">Click to upload banner</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Recommended: 1200×600 · Max 5MB</p>
                <input type="file" className="hidden" accept="image/*" onChange={handleBannerImageChange} />
              </label>
              {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200 h-36 group">
                  <img src={previewUrl} alt="Banner Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><Image className="w-3.5 h-3.5" /> Banner Preview</span>
                  </div>
                </div>
              ) : (
                <div className="h-36 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xs italic bg-white/50">No banner selected</div>
              )}
            </div>
          </Section>

          {/* ── Notifications ── */}
          <div className="border-t border-slate-100" />
          <Section icon={<Bell className="w-3.5 h-3.5 text-indigo-500" />} title="Notification Settings">
            <p className="text-[11px] text-slate-400">Select who should receive an automatic email notification about this event.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Builders */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" name="notify_builders" checked={formData.notify_builders} onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-500" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 uppercase tracking-wide transition-colors">Notify Builders</span>
                </label>
                {formData.notify_builders && (
                  <NotifyList
                    list={filteredBuilders}
                    selectedIds={selectedBuilderIds}
                    searchTerm={searchTermBuilders}
                    onSearch={setSearchTermBuilders}
                    onToggle={toggleBuilderSelection}
                    onToggleAll={() => setSelectedBuilderIds(selectedBuilderIds.length === allBuilders.length ? [] : allBuilders.map((b) => b.id))}
                  />
                )}
              </div>

              {/* Buyers */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" name="notify_buyers" checked={formData.notify_buyers} onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-500" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 uppercase tracking-wide transition-colors">Notify Buyers</span>
                </label>
                {formData.notify_buyers && (
                  <NotifyList
                    list={filteredBuyers}
                    selectedIds={selectedBuyerIds}
                    searchTerm={searchTermBuyers}
                    onSearch={setSearchTermBuyers}
                    onToggle={toggleBuyerSelection}
                    onToggleAll={() => setSelectedBuyerIds(selectedBuyerIds.length === allBuyers.length ? [] : allBuyers.map((b) => b.id))}
                  />
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic">* If no specific users are selected but a category is checked, all users in that category will be notified by default.</p>
          </Section>

          {/* ── Submit ── */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white rounded-lg text-sm font-bold transition-all duration-200 shadow-[0_4px_12px_rgba(14,165,233,0.25)] active:scale-[0.98] disabled:cursor-not-allowed">
              {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Creating…</span></>) : (<><CheckCircle2 className="w-4 h-4" /><span>Create Property Event</span></>)}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreatePropertyEvent;