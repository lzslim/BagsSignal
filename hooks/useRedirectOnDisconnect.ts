"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function useRedirectOnDisconnect() {
  const { connected, connecting, disconnecting } = useWallet();
  const router = useRouter();
  const wasConnectedRef = useRef(connected);

  useEffect(() => {
    const wasConnected = wasConnectedRef.current;

    if (wasConnected && !connected && !connecting && !disconnecting) {
      router.replace("/");
    }

    wasConnectedRef.current = connected;
  }, [connected, connecting, disconnecting, router]);
}
