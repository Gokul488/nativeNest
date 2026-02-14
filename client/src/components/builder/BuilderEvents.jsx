import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaArrowRight, 
  FaSearch, 
  FaCalendarCheck 
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from '../../config.js';

const BuilderEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/api/builder/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(response.data.events || []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [navigate]);

  const filteredEvents = events.filter(event => 
    event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading upcoming events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- HEADER SECTION (Matched to Properties Page) --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Property Exhibitions</h2>
          <p className="text-slate-500 font-medium mt-1">Discover and book stalls at upcoming regional property launches.</p>
        </div>
        {/* Statistics Badge (Matches the "Post Property" button position) */}
        <div className="inline-flex items-center gap-4 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <FaCalendarCheck />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Events</p>
            <p className="text-xl font-black text-slate-900 leading-tight">{events.length}</p>
          </div>
        </div>
      </div>

      {/* --- SEARCH BAR (Matched to Properties Page) --- */}
      <div className="relative group max-w-md">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
        <input 
          type="text" 
          placeholder="Search by event name or city..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
          {error}
        </div>
      )}

      {/* --- EVENTS LIST (Matched to Properties Row Design) --- */}
      <div className="grid grid-cols-1 gap-4">
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-4xl p-16 text-center border border-slate-200 border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCalendarAlt className="text-slate-300 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No events found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search or check back later for new exhibition dates.</p>
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <div 
              key={event.id} 
              className="group bg-white p-5 rounded-3xl border border-slate-200 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-500 flex flex-col md:flex-row items-center gap-6"
            >
              {/* Index & Icon */}
              <div className="hidden md:flex w-12 h-12 rounded-2xl bg-slate-100 items-center justify-center text-slate-400 font-black group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                {String(index + 1).padStart(2, '0')}
              </div>

              {/* Event Info */}
              <div className="flex-1 min-w-0 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-widest">
                    {event.event_type}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-teal-600 transition-colors truncate">
                  {event.event_name}
                </h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <FaMapMarkerAlt className="text-teal-500" /> {event.city}
                  </span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <FaClock className="text-indigo-500" /> {event.start_time?.slice(0, 5)} onwards
                  </span>
                </div>
              </div>

              {/* Date Badge (Matched to Property Price Tag) */}
              <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-teal-50 group-hover:border-teal-100 transition-colors min-w-[150px]">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exhibition Date</span>
                <span className="text-lg font-black text-slate-900">
                  {format(new Date(event.start_date), "dd MMM yyyy")}
                </span>
              </div>

              {/* Action Button */}
              <div className="flex items-center">
                <Link
                  to={`/builder-dashboard/stall-booking/${event.id}`}
                  className="inline-flex items-center gap-3 bg-teal-600 text-white px-8 py-4 rounded-2xl hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/20 transition-all duration-300 font-bold active:scale-95 whitespace-nowrap"
                >
                  Book Stall <FaArrowRight />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BuilderEvents;