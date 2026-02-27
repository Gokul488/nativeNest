import React, { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

const OngoingEventsMarquee = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  // Check if buyer is logged in
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isBuyerLoggedIn = !!token && user.account_type === "buyer";

  useEffect(() => {
    const fetchOngoingEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/events/ongoing`);
        setEvents(res.data || []);
      } catch (error) {
        console.error("Failed to fetch ongoing events", error);
      }
    };

    fetchOngoingEvents();
  }, []);

  const handleEventClick = () => {
    if (isBuyerLoggedIn) {
      navigate("/buyer-dashboard/events");
    } else {
      navigate("/login", { state: { from: "/buyer-dashboard/events" } });
    }
  };

  if (!events.length) return null;

  return (
    <div
      className="bg-[#011936] text-white py-2 cursor-pointer"
      onClick={handleEventClick}
      title="Click to explore and register for events"
    >
      <Marquee speed={60} gradient={false} pauseOnHover direction="left">
        {events.map((event) => (
          <span
            key={event.id}
            className="mx-10 text-sm sm:text-base font-medium whitespace-nowrap inline-flex items-center gap-3 select-none"
          >
            {/* Announcement Icon */}
            <i className="fas fa-bullhorn text-yellow-300"></i>

            <strong>{event.event_name}</strong> ({event.event_type}) |

            {/* Location Icon */}
            <i className="fas fa-map-marker-alt text-red-400"></i>
            {event.event_location && `${event.event_location}, `}
            {event.city}, {event.state} |

            {/* Calendar Icon */}
            <i className="fas fa-calendar-alt text-cyan-300"></i>
            {new Date(event.start_date).toLocaleDateString()} {" – "}
            {new Date(event.end_date).toLocaleDateString()}
          </span>
        ))}
      </Marquee>
    </div>
  );
};

export default OngoingEventsMarquee;