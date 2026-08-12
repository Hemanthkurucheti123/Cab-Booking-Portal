import { useState } from "react";
import { createBooking } from "../../api/bookings";
import { useNavigate } from "react-router-dom";

function CreateBooking() {
  const [form, setForm] = useState({
    guest_name: "",
    guest_location: "",
    guest_contact: "",
    reference_name: "",
    trip_details: "",
    pickup_time: "",
    drop_time: "",
    location_link: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await createBooking(form);
      navigate("/company/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create booking");
    }
  }

  return (
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
      <h2 className="mb-4">Create Booking</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Guest Name</label>
          <input name="guest_name" className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Guest Location</label>
          <input name="guest_location" className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Guest Contact</label>
          <input name="guest_contact" className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Reference Name</label>
          <input name="reference_name" className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Trip Details</label>
          <textarea name="trip_details" className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Pickup Time</label>
          <input type="datetime-local" name="pickup_time" className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Drop Time</label>
          <input type="datetime-local" name="drop_time" className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Location Link</label>
          <input name="location_link" className="form-control" onChange={handleChange} />
        </div>
        <button type="submit" className="btn btn-success">Create Booking</button>
      </form>
    </div>
  );
}

export default CreateBooking;