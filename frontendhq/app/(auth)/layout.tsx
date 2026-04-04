import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth/AuthContext";
import { Background } from "@/components/auth/Background";
import { Navbar } from "@/components/auth/Navbar";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AuthProvider>
      <div style={{ minHeight: "100vh", background: "#050A05" }}>
        <Background />
        <Navbar />
        {children}
      </div>
    </AuthProvider>
  );
}
