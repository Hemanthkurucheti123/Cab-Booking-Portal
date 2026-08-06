import React, { useEffect, useState } from 'react';

function App() {
  const [apiMessage, setApiMessage] = useState('Connecting to backend...');

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then((res) => res.json())
      .then((data) => setApiMessage(data.message))
      .catch(() => setApiMessage('Backend unreachable'));
  }, []);

  return (
    <div className="container py-5">
      <header className="pb-3 mb-4 border-bottom">
        <h1 className="display-5 fw-bold text-primary">Cab Booking Portal</h1>
        <p className="text-muted">Corporate Ride Management System</p>
      </header>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card h-100 border-primary">
            <div className="card-body">
              <h5 className="card-title text-primary">Company Workspace</h5>
              <p className="card-text">
                Create ride requests and monitor active trips across mapped vendors.
              </p>
              <button className="btn btn-primary" disabled>Company Portal</button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100 border-success">
            <div className="card-body">
              <h5 className="card-title text-success">Vendor Workspace</h5>
              <p className="card-text">
                Accept incoming bookings, dispatch drivers, or post trips to the open marketplace.
              </p>
              <button className="btn btn-success" disabled>Vendor Portal</button>
            </div>
          </div>
        </div>
      </div>

      <div className="alert alert-info" role="alert">
        <strong>Backend Connection Status:</strong> {apiMessage}
      </div>
    </div>
  );
}

export default App;