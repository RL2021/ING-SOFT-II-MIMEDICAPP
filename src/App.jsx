import { Navigate, Route, Routes } from "react-router-dom";
import Appointments from "./pages/Appointments";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Medicines from "./pages/Medicines";
import Settings from "./pages/Settings";
import Exercise from "./pages/Exercise";
import ForgotPassword from "./pages/ForgotPassword";
import Foods from "./pages/Foods";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot_password" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/citas-medicas" element={<Appointments />} />
      <Route path="/dashboard/medicamentos" element={<Medicines />} />
      <Route path="/dashboard/configuracion" element={<Settings />} />
      <Route path="/dashboard/foods" element={<Foods />} />
      <Route path="/exercise" element={<Exercise />} />



      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}