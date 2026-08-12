import StatusBadge from "./StatusBadge";

function BookingTable({ bookings }) {
  if (bookings.length === 0) {
    return <p className="text-muted">No bookings yet.</p>;
  }

  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th>Guest</th>
          <th>Location</th>
          <th>Pickup Time</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((b) => (
          <tr key={b.id}>
            <td>{b.guest_name}</td>
            <td>{b.guest_location}</td>
            <td>{b.pickup_time ? new Date(b.pickup_time).toLocaleString() : "-"}</td>
            <td><StatusBadge status={b.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default BookingTable;