import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/company/Login";
import Dashboard from "./pages/company/Dashboard";
import CreateBooking from "./pages/company/CreateBooking";

import VendorLogin from "./pages/vendor/Login";
import LiveRequests from "./pages/vendor/LiveRequests";
import AllBookings from "./pages/vendor/AllBookings";
import VendorNav from "./components/VendorNav";

function VendorLayout({ children }) {
  return (
    <>
      <VendorNav />
      {children}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/company/login" element={<Login />} />
        <Route path="/company/dashboard" element={<Dashboard />} />
        <Route path="/company/create-booking" element={<CreateBooking />} />

        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route
          path="/vendor/live-requests"
          element={<VendorLayout><LiveRequests /></VendorLayout>}
        />
        <Route
          path="/vendor/dashboard"
          element={<VendorLayout><LiveRequests /></VendorLayout>}
        />
        <Route
          path="/vendor/bookings"
          element={<VendorLayout><AllBookings /></VendorLayout>}
        />

        <Route path="/" element={<Navigate to="/company/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;