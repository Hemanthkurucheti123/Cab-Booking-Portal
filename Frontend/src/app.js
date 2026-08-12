import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/company/Login";
import Dashboard from "./pages/company/Dashboard";
import CreateBooking from "./pages/company/CreateBooking";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/company/login" element={<Login />} />
        <Route path="/company/dashboard" element={<Dashboard />} />
        <Route path="/company/create-booking" element={<CreateBooking />} />
        <Route path="/" element={<Navigate to="/company/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;