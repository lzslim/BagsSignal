"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

export function ClientWalletButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className="h-[42px] min-w-[140px] rounded-xl border border-brand/40 bg-brand/[0.08]"
      />
    );
  }

  return <WalletMultiButton />;
}
