// This is the main App.tsx file for the Spanish Tax Buddy application

import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/features/auth/AuthContext";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

// Pages
import Admin from "@/pages/Admin";
import Dashboard from "@/pages/Dashboard";
import FormFill from "@/pages/FormFill";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Register from "@/pages/Register";
import TermsOfUse from "@/pages/TermsOfUse";

// Components

import CookieConsent from "@/components/CookieConsent";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster } from "sonner";
import AdminRoute from "./components/AdminRoute";
import { ThemeProvider } from "./components/ThemeProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfUse />} />

              {/* Protected Routes - require authentication */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/form/:formId"
                element={
                  <ProtectedRoute>
                    <FormFill />
                  </ProtectedRoute>
                }
              />

              {/* Admin Route - requires admin role */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            <Toaster />
            <CookieConsent />
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
