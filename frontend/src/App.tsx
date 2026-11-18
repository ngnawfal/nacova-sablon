import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/lib/auth-context";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AttendancePage } from "@/pages/AttendancePage";
import { RecapPage } from "@/pages/RecapPage";
import { CustomersPage } from "@/pages/CustomersPage";
import { UsersPage } from "@/pages/UsersPage";

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
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
