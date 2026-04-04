"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthData {
  walletAddress: string | null;
  walletProvider: string | null;
}

interface AuthContextType extends AuthData {
  setWalletAddress: (addr: string | null) => void;
  setWalletProvider: (provider: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  walletAddress: null,
  walletProvider: null,
  setWalletAddress: () => {},
  setWalletProvider: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletProvider, setWalletProvider] = useState<string | null>(null);

  return (
    <AuthContext.Provider
      value={{ walletAddress, walletProvider, setWalletAddress, setWalletProvider }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}


