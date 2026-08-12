import { Link, useNavigate } from "react-router-dom";

function VendorNav() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");

  function handleLogout() {
    localStorage.clear();
    navigate("/vendor/login");
  }

  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark px-3">
      <span className="navbar-brand">Vendor: {userName}</span>
      <div className="navbar-nav">
        <Link className="nav-link text-white" to="/vendor/live-requests">Live Requests</Link>
        <Link className="nav-link text-white" to="/vendor/bookings">All Bookings</Link>
      </div>
      <button className="btn btn-outline-light ms-auto" onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default VendorNav;