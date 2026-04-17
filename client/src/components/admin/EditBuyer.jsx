// src/components/admin/EditBuyer.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config.js";
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiLock, FiType, FiMapPin, FiGlobe, FiCalendar, FiArrowLeft } from "react-icons/fi";
import { CheckCircle2, AlertCircle, Loader2, Camera } from "lucide-react";

const EditBuyer = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        // We use the admin users list or a specific fetch if we have one. 
        // For now, let's fetch all users and find this one, or assume there's a specific fetch.
        // I'll update adminController to have getSingleUser if needed, 
        // but for now I'll just use the list fetching logic.
        const res = await axios.get(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data.find(u => String(u.id) === String(userId));

        if (user) {
          setName(user.name || "");
          setEmail(user.email || "");
          setMobileNumber(user.mobile_number || "");
          setGender(user.gender || "");
          setDob(user.dob ? user.dob.split('T')[0] : "");
          setCity(user.city || "");
          setCountry(user.country || "");
          setPhotoBase64(user.photo ? `data:image/jpeg;base64,${user.photo}` : "");
        } else {
          setError("User not found");
        }
      } catch (err) {
        setError("Failed to fetch user details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        name, email, mobile_number: mobileNumber, gender, dob, city, country, photo: photoBase64.split(',')[1] || photoBase64
      };
      if (password.trim()) payload.password = password;

      await axios.put(`${API_BASE_URL}/api/admin/users/${userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("User profile updated successfully!");
      setTimeout(() => navigate("/manage-users"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";

  const labelClass =
    "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 group-focus-within:text-indigo-500 transition-colors";

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/manage-users")}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors"
        >
          <FiArrowLeft /> Back to Users
        </button>
        <h2 className="text-xl font-extrabold text-slate-800">Edit Buyer Profile</h2>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="px-8 py-8">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl mb-6 border border-red-100 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-2xl mb-6 border border-emerald-100 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                    {photoBase64 ? (
                      <img src={photoBase64} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <FiUser size={48} className="text-slate-300" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-indigo-700 hover:scale-110 transition-all">
                    <Camera size={18} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setPhotoBase64(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Profile Photo</p>
                </div>
              </div>

              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    <input type="text" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))} className={inputClass} maxLength="10" required />
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
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="City" />
                  </div>
                </div>
                <div className="group">
                  <label className={labelClass}>Country</label>
                  <div className="relative">
                    <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} placeholder="Country" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="group">
                <label className={labelClass}>Reset Password (Optional)</label>
                <div className="relative max-w-md">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password to reset"
                    className={inputClass}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500">
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <> <CheckCircle2 className="w-5 h-5" /> Update User Profile </>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBuyer;
