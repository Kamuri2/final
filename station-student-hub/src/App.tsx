// 1. Importación desde la raíz para mayor compatibilidad con Vite
import { ApolloProvider } from "@apollo/client/react";
import { client } from "@/lib/apollo";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AlumnoPage from "./pages/Alumno";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const App = () => (
  <ApolloProvider client={client}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/admin"
              element={

                <ProtectedRoute requiredRole="Administrador">
                  <Admin />
                </ProtectedRoute>
              }
            />

            <Route
              path="/alumno"
              element={
                <ProtectedRoute requiredRole="alumno">
                  <AlumnoPage />
                </ProtectedRoute>
              }
            />


            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </ApolloProvider>
);

export default App;