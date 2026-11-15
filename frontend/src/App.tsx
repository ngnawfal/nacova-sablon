import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, ProtectedRoute, useAuth } from "@/lib/auth-context";
import { LoginPage } from "@/pages/LoginPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SprintZeroLanding() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <main className="min-h-screen bg-page text-ink flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Nacova — Sprint 0 (Setup Siap)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-sec">
            Autentikasi aktif sebagai <strong className="text-ink">{user.name}</strong> ({user.role}).
          </p>
          <Button variant="outline" onClick={() => void logout()}>
            Keluar
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <SprintZeroLanding />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
