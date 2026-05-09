"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { Buffer } from "buffer";
import { useState } from "react";

type PrepareClaimResponse = {
  transactions: Array<{
    tx: string;
    blockhash?: {
      blockhash: string;
      lastValidBlockHeight: number;
    };
  }>;
};

type PrepareAllClaimResponse = {
  tokens: Array<{
    mint: string;
    transactions: Array<{
      tx: string;
      blockhash?: {
        blockhash: string;
        lastValidBlockHeight: number;
      };
    }>;
  }>;
};

export function useClaim() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [isClaiming, setIsClaiming] = useState(false);

  async function claimOne(mint: string) {
    if (!wallet.publicKey || !wallet.signAllTransactions) {
      throw new Error("Wallet is not ready for signing");
    }

    setIsClaiming(true);
    try {
      const response = await fetch("/api/claim/prepare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wallet: wallet.publicKey.toBase58(),
          mint
        })
      });
      const payload = (await response.json()) as PrepareClaimResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Failed to prepare claim");

      return signAndBroadcast(payload.transactions);
    } finally {
      setIsClaiming(false);
    }
  }

  async function claimAll() {
    if (!wallet.publicKey || !wallet.signAllTransactions) {
      throw new Error("Wallet is not ready for signing");
    }

    setIsClaiming(true);
    try {
      const response = await fetch("/api/claim/prepare-all", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wallet: wallet.publicKey.toBase58()
        })
      });
      const payload = (await response.json()) as PrepareAllClaimResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Failed to prepare claims");

      const transactions = payload.tokens.flatMap((token) => token.transactions);
      return signAndBroadcast(transactions);
    } finally {
      setIsClaiming(false);
    }
  }

  async function signAndBroadcast(transactions: PrepareClaimResponse["transactions"]) {
    const decoded = transactions.map((item) =>
      VersionedTransaction.deserialize(Buffer.from(item.tx, "base64"))
    );
    const signed = await wallet.signAllTransactions!(decoded);
    const signatures: string[] = [];

    for (let index = 0; index < signed.length; index += 1) {
      const tx = signed[index];
      const signature = await connection.sendRawTransaction(tx.serialize());
      const latestBlockhash = transactions[index]?.blockhash ?? (await connection.getLatestBlockhash());
      await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
        },
        "confirmed"
      );
      signatures.push(signature);
    }

    return signatures;
  }

  return {
    isClaiming,
    claimOne,
    claimAll
  };
}
