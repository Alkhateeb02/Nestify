import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home/Home";
import LoginPage from "./pages/LoginPage";
import PropertyBrowsePage from "./pages/PropertyBrowsePage";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import OwnerLoginPage from "./pages/OwnerLoginPage";
import OwnerDashboard from "./pages/OwnerDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import VerifyEmail from "./pages/VerifyEmail";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import StudentMaintenance from "./pages/StudentMaintenance";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import FloatingAI from "./components/layout/FloatingAI";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let timeoutId;
    const timeoutDuration = 20 * 60 * 1000; // 20 minutes

    const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(logout, timeoutDuration);
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [location.pathname, navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/student" element={<PropertyBrowsePage />} />

        <Route path="/property/:id" element={<PropertyDetailsPage />} />
        <Route path="/owner-login" element={<OwnerLoginPage />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-maintenance" element={<StudentMaintenance />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
      <FloatingAI />
    </>
  );
}