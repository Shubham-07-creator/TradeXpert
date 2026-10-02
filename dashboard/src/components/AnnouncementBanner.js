import React, { useEffect, useState } from "react";
import axios from "axios";
import { socket } from "../utils/socket";
import { API } from "../utils/auth";
import "./AnnouncementBanner.css";

const AnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissedId, setDismissedId] = useState(null);

  useEffect(() => {
    // 1. Initial fetch from REST API
    axios
      .get(`${API}/system/announcement`)
      .then((res) => {
        if (res.data?.announcement) {
          setAnnouncement(res.data.announcement);
        }
      })
      .catch(() => {});

    // 2. Real-time updates via Socket.io
    const handleAnnouncement = (data) => {
      setAnnouncement(data);
      // Reset dismissal if it's a new announcement ID
      if (data && data.id !== dismissedId) {
        setDismissedId(null);
      }
    };

    socket.on("system:announcement", handleAnnouncement);
    return () => socket.off("system:announcement", handleAnnouncement);
  }, [dismissedId]);

  if (!announcement || !announcement.message || dismissedId === announcement.id) {
    return null;
  }

  const levelClass =
    announcement.level === "critical"
      ? "broadcast-critical"
      : announcement.level === "info"
      ? "broadcast-info"
      : "broadcast-warning";

  const getTag = () => {
    switch (announcement.level) {
      case "critical":
        return "CRITICAL";
      case "info":
        return "INFO";
      case "warning":
      default:
        return "NOTICE";
    }
  };

  return (
    <div className={`system-broadcast-bar ${levelClass}`}>
      <div className="broadcast-content">
        <span className={`status-dot ${announcement.level === "critical" ? "red" : announcement.level === "info" ? "green" : "amber"}`} />
        <span className="broadcast-tag">{getTag()}</span>
        <span className="broadcast-message">{announcement.message}</span>
      </div>
      <button
        className="broadcast-close-btn"
        onClick={() => setDismissedId(announcement.id)}
        title="Dismiss announcement"
      >
        ✕
      </button>
    </div>
  );
};

export default AnnouncementBanner;
