import { useEffect, useState, useCallback } from "react";
import { getBookings, acceptBooking, rejectBooking, placeInOpenMarket } from "../../api/bookings";
import { useSocket } from "../../hooks/useSocket";
import StatusBadge from "../../components/StatusBadge";

function LiveRequests() {
  const [bookings, setBookings] = useState([]);
  const userId = localStorage.getItem("userId");

  const fetchBookings = useCallback(async () => {
    const res = await getBookings();
    // only show requests that need a vendor decision
    const pending = res.data.filter(
      (b) => b.status === "pending" || b.status === "open_market"
    );
    setBookings(pending);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useSocket(userId, () => {
    fetchBookings();
  });

  async function handleAccept(id) {
    try {
      await acceptBooking(id, {});
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to accept");
    }
  }

  async function handleReject(id) {
    try {
      await rejectBooking(id);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to reject");
    }
  }

  async function handleOpenMarket(id) {
    try {
      await placeInOpenMarket(id);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to place in open market");
    }
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Live Booking Requests</h2>
      {bookings.length === 0 && <p className="text-muted">No live requests right now.</p>}

      {bookings.map((b) => (
        <div className="card mb-3" key={b.id}>
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <h5 className="card-title">{b.guest_name}</h5>
              <StatusBadge status={b.status} />
            </div>
            <p className="card-text mb-1"><strong>Location:</strong> {b.guest_location}</p>
            <p className="card-text mb-1"><strong>Contact:</strong> {b.guest_contact}</p>
            <p className="card-text mb-3">
              <strong>Pickup:</strong> {b.pickup_time ? new Date(b.pickup_time).toLocaleString() : "-"}
            </p>
            {b.status === "pending" && (
              <div className="d-flex gap-2">
                <button className="btn btn-success" onClick={() => handleAccept(b.id)}>Accept</button>
                <button className="btn btn-danger" onClick={() => handleReject(b.id)}>Reject</button>
                <button className="btn btn-warning" onClick={() => handleOpenMarket(b.id)}>
                  Place in Open Market
                </button>
              </div>
            )}
            {b.status === "open_market" && (
              <button className="btn btn-success" onClick={() => handleAccept(b.id)}>
                Accept (Open Market)
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default LiveRequests;