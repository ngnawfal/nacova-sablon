import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/lib/auth-context";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AttendancePage } from "@/pages/AttendancePage";
import { RecapPage } from "@/pages/RecapPage";
import { CustomersPage } from "@/pages/CustomersPage";
import { UsersPage } from "@/pages/UsersPage";
import { StockPage } from "@/pages/StockPage";
import { StockMutationPage } from "@/pages/StockMutationPage";
import { StockDetailPage } from "@/pages/StockDetailPage";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/absensi" element={<AttendancePage />} />
            <Route
              path="/absensi/rekap"
              element={
                <ProtectedRoute roles={["OWNER", "ADMIN"]}>
                  <RecapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pelanggan"
              element={
                <ProtectedRoute roles={["OWNER", "ADMIN"]}>
                  <CustomersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/karyawan"
              element={
                <ProtectedRoute roles={["OWNER"]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route path="/stok" element={<StockPage />} />
            <Route
              path="/stok/mutasi"
              element={
                <ProtectedRoute roles={["OWNER", "ADMIN"]}>
                  <StockMutationPage />
                </ProtectedRoute>
              }
            />
            <Route path="/stok/:id" element={<StockDetailPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
