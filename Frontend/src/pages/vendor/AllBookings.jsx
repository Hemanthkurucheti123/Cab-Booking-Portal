import { useEffect, useState, useCallback } from "react";
import { getBookings, startTrip, endTrip } from "../../api/bookings";
import { useSocket } from "../../hooks/useSocket";
import StatusBadge from "../../components/StatusBadge";

function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const userId = localStorage.getItem("userId");

  const fetchBookings = useCallback(async () => {
    const res = await getBookings();
    setBookings(res.data);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useSocket(userId, () => {
    fetchBookings();
  });

  async function handleStartTrip(id) {
    try {
      await startTrip(id);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to start trip");
    }
  }

  async function handleEndTrip(id) {
    try {
      await endTrip(id);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to end trip");
    }
  }

  const filtered = bookings.filter((b) =>
    (b.guest_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2 className="mb-4">All Bookings</h2>
      <input
        className="form-control mb-3"
        placeholder="Search by guest name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Guest</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((b) => (
            <tr key={b.id}>
              <td>{b.id.slice(0, 8)}...</td>
              <td>{b.guest_name}</td>
              <td>{b.guest_location}</td>
              <td><StatusBadge status={b.status} /></td>
              <td>
                {b.status === "accepted" && (
                  <button className="btn btn-sm btn-primary" onClick={() => handleStartTrip(b.id)}>
                    Start Trip
                  </button>
                )}
                {b.status === "ongoing" && (
                  <button className="btn btn-sm btn-success" onClick={() => handleEndTrip(b.id)}>
                    End Trip
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AllBookings;