import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";
import Dashboard from "./Dashboard";
import BookingPage from "./BookingPage";
import ProtectedRoute from "./ProtectedRoute";
import FeaturesPage from "./FeaturesPage";
import HowItWorksPage from "./HowItWorksPage";
import AboutPage from "./AboutPage";
import ContactPage from "./ContactPage";
import BookingHistoryPage from "./BookingHistoryPage";
import EarningsPage from "./EarningsPage";
import LiveLocationPage from "./LiveLocationPage"; // ✅ Only ONE import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/booking" element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        } />
        <Route path="/booking-history" element={
          <ProtectedRoute>
            <BookingHistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/earnings" element={
          <ProtectedRoute>
            <EarningsPage />
          </ProtectedRoute>
        } />
        <Route path="/live-location" element={
          <ProtectedRoute>
            <LiveLocationPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;