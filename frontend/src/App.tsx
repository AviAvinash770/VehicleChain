import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { WalletProvider } from "./contexts/WalletContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AuthorityDashboard } from "./pages/AuthorityDashboard";
import { OwnerDashboard } from "./pages/OwnerDashboard";
import { BuyerDashboard } from "./pages/BuyerDashboard";
import { RegisterVehiclePage } from "./pages/RegisterVehiclePage";
import { InitiateTransferPage } from "./pages/InitiateTransferPage";
import { TransferDetailsPage } from "./pages/TransferDetailsPage";
import { VehicleDetailsPage } from "./pages/VehicleDetailsPage";
import { PublicVerifyPage } from "./pages/PublicVerifyPage";
import { QrScannerPage } from "./pages/QrScannerPage";
import { DigitalCertificatePage } from "./pages/DigitalCertificatePage";

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070a12] text-cyan-400">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <WalletProvider>
          <div className="min-h-screen flex flex-col bg-[#070a12] text-slate-100">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify" element={<PublicVerifyPage />} />
                <Route path="/verify/:query" element={<PublicVerifyPage />} />
                <Route path="/scan" element={<QrScannerPage />} />
                <Route path="/certificate/:id" element={<DigitalCertificatePage />} />
                <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
                <Route path="/transfers/:id" element={<TransferDetailsPage />} />

                {/* Role Protected Routes */}
                <Route
                  path="/dashboard/authority"
                  element={
                    <ProtectedRoute allowedRoles={["AUTHORITY"]}>
                      <AuthorityDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/owner"
                  element={
                    <ProtectedRoute allowedRoles={["OWNER"]}>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/buyer"
                  element={
                    <ProtectedRoute allowedRoles={["BUYER"]}>
                      <BuyerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vehicles/register"
                  element={
                    <ProtectedRoute allowedRoles={["AUTHORITY"]}>
                      <RegisterVehiclePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transfers/initiate"
                  element={
                    <ProtectedRoute allowedRoles={["OWNER"]}>
                      <InitiateTransferPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </WalletProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
