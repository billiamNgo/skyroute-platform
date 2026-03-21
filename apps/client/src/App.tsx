import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import PharmacistDashboard from "./pages/PharmacistDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OrdersPage from "./pages/OrdersPage"

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
            <ProtectedRoute 
              allowedRole="technician"
              component={<TechnicianDashboard />}
            />
          }
        />

        <Route 
          path="/orders"
          element={
            <ProtectedRoute
              allowedRole="technician"
              component={<OrdersPage />}
            />
          }
        />

        <Route 
          path="/pharmacist" 
          element={
            <ProtectedRoute 
              allowedRole="pharmacist"
              component={<PharmacistDashboard />}
            />
          }
        />

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute 
              allowedRole="admin"
              component={<AdminDashboard />}
            />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;