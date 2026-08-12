import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getBookings } from "../../api/bookings";
import { useSocket } from "../../hooks/useSocket";
import BookingTable from "../../components/BookingTable";

const TABS = ["upcoming", "ongoing", "completed", "cancelled"];

function statusToTab(status) {
  if (status === "accepted" || status === "pending" || status === "open_market") return "upcoming";
  if (status === "ongoing") return "ongoing";
  if (status === "completed") return "completed";
  if (status === "cancelled" || status === "rejected") return "cancelled";
  return "upcoming";
}

function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const userId = localStorage.getItem("userId");

  const fetchBookings = useCallback(async () => {
    const res = await getBookings();
    setBookings(res.data);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // whenever a live status update arrives, just re-fetch the full list —
  // simplest approach for now, good enough for this project's scale
  useSocket(userId, () => {
    fetchBookings();
  });

  const filtered = bookings.filter((b) => statusToTab(b.status) === activeTab);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Company Dashboard</h2>
        <Link to="/company/create-booking" className="btn btn-success">+ New Booking</Link>
      </div>

      <ul className="nav nav-tabs mb-3">
        {TABS.map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          </li>
        ))}
      </ul>

      <BookingTable bookings={filtered} />
    </div>
  );
}

export default Dashboard;