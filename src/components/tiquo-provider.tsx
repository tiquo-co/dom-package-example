"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  TiquoAuth,
  type TiquoSession,
  type VerifyOTPResult,
} from "@tiquo/dom-package";

export type TiquoStatus = "loading" | "signed-out" | "signed-in" | "unconfigured";

type TiquoContextValue = {
  client: TiquoAuth | null;
  session: TiquoSession | null;
  status: TiquoStatus;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, code: string) => Promise<VerifyOTPResult>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  track: (event: string, eventName: string, properties?: Record<string, unknown>) => void;
};

const TiquoContext = createContext<TiquoContextValue | null>(null);

const publicKey = process.env.NEXT_PUBLIC_TIQUO_PUBLIC_KEY?.trim();
const hasUsableKey = Boolean(
  publicKey && publicKey.startsWith("pk_dom_") && !publicKey.includes("your_key_here"),
);

export function TiquoProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [client, setClient] = useState<TiquoAuth | null>(null);
  const [session, setSession] = useState<TiquoSession | null>(null);
  const [status, setStatus] = useState<TiquoStatus>(hasUsableKey ? "loading" : "unconfigured");

  useEffect(() => {
    if (!hasUsableKey || !publicKey) {
      return;
    }

    const tiquo = new TiquoAuth({
      publicKey,
      analytics: true,
      enableTabSync: true,
      debug: process.env.NODE_ENV === "development",
    });
    let active = true;

    const applySession = (nextSession: TiquoSession | null) => {
      if (!active) return;
      setSession(nextSession);
      setStatus(nextSession ? "signed-in" : "signed-out");
    };

    const unsubscribe = tiquo.onAuthStateChange(applySession);

    void Promise.resolve().then(() => {
      if (!active) return;
      setClient(tiquo);
      void tiquo.getUser().then(applySession).catch(() => applySession(null));
    });

    return () => {
      active = false;
      unsubscribe();
      tiquo.destroy();
      setClient(null);
    };
  }, []);

  const sendOTP = useCallback(
    async (email: string) => {
      if (!client) throw new Error("The Tiquo SDK is not configured.");
      await client.sendOTP(email);
    },
    [client],
  );

  const verifyOTP = useCallback(
    async (email: string, code: string) => {
      if (!client) throw new Error("The Tiquo SDK is not configured.");
      const result = await client.verifyOTP(email, code);
      const nextSession = await client.getUser();
      setSession(nextSession);
      setStatus(nextSession ? "signed-in" : "signed-out");
      return result;
    },
    [client],
  );

  const logout = useCallback(async () => {
    if (!client) return;
    await client.logout();
    setSession(null);
    setStatus("signed-out");
  }, [client]);

  const refreshSession = useCallback(async () => {
    if (!client) return;
    const nextSession = await client.getUser();
    setSession(nextSession);
    setStatus(nextSession ? "signed-in" : "signed-out");
  }, [client]);

  const track = useCallback(
    (event: string, eventName: string, properties?: Record<string, unknown>) => {
      void client?.analytics
        ?.track(event, { eventName, eventProperties: properties })
        .catch(() => undefined);
    },
    [client],
  );

  const value = useMemo<TiquoContextValue>(
    () => ({ client, session, status, sendOTP, verifyOTP, logout, refreshSession, track }),
    [client, session, status, sendOTP, verifyOTP, logout, refreshSession, track],
  );

  return <TiquoContext.Provider value={value}>{children}</TiquoContext.Provider>;
}

export function useTiquo() {
  const context = useContext(TiquoContext);
  if (!context) throw new Error("useTiquo must be used inside TiquoProvider.");
  return context;
}
