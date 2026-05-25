import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiBriefcase, FiPlus, FiTrash2 } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import API_BASE_URL from "../../config.js";

const CreateBuilder = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    mobile_number: "",
    password: "",
    confirm_password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    if (currentUser.builder_type !== "BuilderAdmin") {
      navigate("/builder-dashboard");
    }
  }, [navigate, currentUser.builder_type]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addTeamMember = () => {
    if (teamMembers.length >= 10) return;
    setTeamMembers([...teamMembers, { name: "", role: "", mobile: "" }]);
  };

  const removeTeamMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index, field, value) => {
    setTeamMembers(prev => prev.map((member, i) => {
      if (i === index) {
        return { ...member, [field]: value };
      }
      return member;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/builder/create`, {
        ...formData,
        team_members: teamMembers
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Builder created successfully!");
      setFormData({ name: "", contact_person: "", email: "", mobile_number: "", password: "", confirm_password: "" });
      setTeamMembers([]);
      setTimeout(() => navigate("/builder-dashboard/manage-builders"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create builder");
    } finally {
      setLoading(false);
    }
  };

  if (currentUser.builder_type !== "BuilderAdmin") return null;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Create New Builder</h2>
        <p className="text-sm text-slate-500 mt-1">Add a new builder to the system.</p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-3">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 mb-6 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-sm font-medium flex items-center gap-3">
          <FiCheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Company Name</label>
            <div className="relative group">
              <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Builder Company Name"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Contact Person</label>
            <div className="relative group">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                required
                placeholder="Contact Person Name"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="builder@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Mobile Number</label>
            <div className="relative group">
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                required
                maxLength={10}
                placeholder="10-digit number"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Team Members</h3>
              <p className="text-xs text-slate-400 mt-0.5">Add up to 10 team members to this builder group.</p>
            </div>
            {teamMembers.length < 10 && (
              <button
                type="button"
                onClick={addTeamMember}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-600 rounded-xl text-xs font-bold border border-sky-100 hover:bg-sky-100 hover:scale-105 active:scale-95 transition-all"
              >
                <FiPlus className="w-3.5 h-3.5" />
                Add Member
              </button>
            )}
          </div>

          {teamMembers.length > 0 ? (
            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <span className="text-xs font-bold text-slate-300 w-5">#{index + 1}</span>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Member Name"
                      value={member.name || ""}
                      onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Role (e.g. Sales)"
                      value={member.role || ""}
                      onChange={(e) => handleMemberChange(index, "role", e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Mobile Number"
                      maxLength={15}
                      value={member.mobile || ""}
                      onChange={(e) => handleMemberChange(index, "mobile", e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <p className="text-xs text-slate-400">No team members added yet. Click "Add Member" to add one.</p>
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/builder-dashboard/manage-builders")}
            className="px-6 py-2.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-sky-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Create Builder"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBuilder;
