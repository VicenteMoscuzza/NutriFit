import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import HomePage from "../pages/HomePage";
import RutinasPage from "../pages/RutinasPage";
import ComidasPage from "../pages/ComidasPage";
import PlanRutinasPage from "../pages/PlanRutinasPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/rutinas" element={<RutinasPage />} />
        <Route path="/rutinas/semana" element={<PlanRutinasPage />} />
        <Route path="/comidas" element={<ComidasPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}