import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import PharmacistDashboard from "./pages/PharmacistDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route 
          path="/technician" 
          element={
            <ProtectedRoute allowedRole="technician">
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/pharmacist" 
          element={
            <ProtectedRoute allowedRole="pharmacist">
              <PharmacistDashboard />
            </ProtectedRoute>
          }
        />


        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;