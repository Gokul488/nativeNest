// src/components/buyer/profileSettings.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../config.js";
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiLock, FiType, FiMapPin, FiGlobe, FiCalendar } from "react-icons/fi";
import { Settings, CheckCircle2, AlertCircle, Loader2, Camera } from "lucide-react";

const ProfileSettings = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // New fields
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [photoBase64, setPhotoBase64] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = response.data;
        setName(user.name || "");
        setEmail(user.email || "");
        setMobileNumber(user.mobile_number || "");
        setGender(user.gender || "");

        // Robust date parsing for input type="date"
        if (user.dob) {
          const dateOnly = user.dob.split(/[T ]/)[0]; // Handles both 'T' and ' ' separators
          setDob(dateOnly);
        } else {
          setDob("");
        }

        setCity(user.city || "");
        setCountry(user.country || "");
        let photoUrl = "";
        if (user.photo) {
          if (typeof user.photo === 'string') {
            // Already has prefix?
            if (user.photo.startsWith('data:')) {
              photoUrl = user.photo;
            } else {
              // Guess MIME type or use jpeg default
              photoUrl = `data:image/jpeg;base64,${user.photo}`;
            }
          } else if (user.photo && typeof user.photo === 'object' && user.photo.type === 'Buffer') {
            // Serialized Buffer object fallback
            const binary = String.fromCharCode.apply(null, new Uint8Array(user.photo.data));
            const base64 = btoa(binary);
            photoUrl = `data:image/jpeg;base64,${base64}`;
          }
        }
        setPhotoBase64(photoUrl);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch user details");
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (password && password !== confirmPassword) {
      setError("New password and confirm password do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        name,
        email,
        mobile_number: mobileNumber,
        gender,
        dob,
        city,
        country,
        photo: photoBase64
      };
      if (password.trim()) payload.password = password;

      const response = await axios.put(`${API_BASE_URL}/api/user`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      setSuccess("Profile updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";

  const labelClass =
    "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 group-focus-within:text-indigo-500 transition-colors";

  return (
    <div className="max-w-2xl mx-auto py-4 px-2 md:px-0">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-6">
          {/* Alerts */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl mb-6 border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-2xl mb-6 border border-emerald-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Top Centered Photo Upload */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-white shadow-md overflow-hidden flex items-center justify-center transition-all group-hover:scale-[1.02] group-hover:shadow-indigo-100/50">
                  {photoBase64 ? (
                    <img src={photoBase64} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <FiUser size={48} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Avatar</span>
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg cursor-pointer hover:bg-indigo-700 hover:scale-110 transition-all active:scale-95 z-20">
                  <Camera size={18} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          alert("Image size must be less than 2MB");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => setPhotoBase64(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
              <div className="text-center mt-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Update Profile Photo</p>
                <p className="text-[9px] text-slate-300">JPG, PNG or WEB-P (Max 2MB)</p>
              </div>
            </div>

            {/* Basic Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="group">
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
                </div>
              </div>
              <div className="group">
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
                </div>
              </div>
              <div className="group">
                <label className={labelClass}>Mobile Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className={inputClass}
                    maxLength="10"
                    required
                  />
                </div>
              </div>
              <div className="group">
                <label className={labelClass}>Gender</label>
                <div className="relative">
                  <FiType className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className={`${inputClass} appearance-none`}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Info Section */}
            <div className="pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="group">
                  <label className={labelClass}>Date of Birth</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="group">
                  <label className={labelClass}>City</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="Your City" />
                  </div>
                </div>
                <div className="group">
                  <label className={labelClass}>Country</label>
                  <div className="relative">
                    <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} placeholder="Your Country" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Security Settings</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className={labelClass}>New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="group">
                  <label className={labelClass}>Confirm Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={!password.trim()}
                      placeholder="••••••••"
                      className={`${inputClass} pr-11 disabled:opacity-50`}
                    />
                    {password.trim() && (
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                      >
                        {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting || (password && password !== confirmPassword)}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Save Profile Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;