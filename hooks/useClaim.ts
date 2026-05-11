"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
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
    const decoded = transactions.map((item) => deserializePreparedTransaction(item.tx));
    const signed = await wallet.signAllTransactions!(decoded);
    const signatures: string[] = [];

    for (let index = 0; index < signed.length; index += 1) {
      const tx = signed[index];
      let signature: string;
      try {
        signature = await connection.sendRawTransaction(tx.serialize());
      } catch (error) {
        throw normalizeRpcSendError(error);
      }
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

function deserializePreparedTransaction(encodedTx: string) {
  const bytes = decodePreparedTransaction(encodedTx);

  try {
    return VersionedTransaction.deserialize(bytes);
  } catch (versionedError) {
    try {
      return Transaction.from(bytes);
    } catch {
      throw versionedError instanceof Error
        ? new Error(`Failed to decode prepared claim transaction: ${versionedError.message}`)
        : new Error("Failed to decode prepared claim transaction");
    }
  }
}

function decodePreparedTransaction(encodedTx: string) {
  const normalized = encodedTx.trim();
  const base64 = normalized.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  if (/^[A-Za-z0-9+/]+={0,2}$/.test(paddedBase64)) {
    const decoded = Buffer.from(paddedBase64, "base64");
    if (decoded.length > 0 && decoded.toString("base64").replace(/=+$/, "") === paddedBase64.replace(/=+$/, "")) {
      return decoded;
    }
  }

  return decodeBase58(normalized);
}

function decodeBase58(value: string) {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const bytes = [0];

  for (const char of value) {
    const index = alphabet.indexOf(char);
    if (index < 0) {
      throw new Error("Prepared claim transaction is not valid base64 or base58");
    }

    let carry = index;
    for (let byteIndex = 0; byteIndex < bytes.length; byteIndex += 1) {
      carry += bytes[byteIndex] * 58;
      bytes[byteIndex] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  for (const char of value) {
    if (char !== "1") break;
    bytes.push(0);
  }

  return Buffer.from(bytes.reverse());
}

function normalizeRpcSendError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("403") || message.toLowerCase().includes("access forbidden")) {
    return new Error(
      "Solana RPC rejected the signed transaction with 403 Access forbidden. Set NEXT_PUBLIC_SOLANA_RPC_URL to a mainnet RPC endpoint that allows sendTransaction/sendRawTransaction, then restart the dev server."
    );
  }

  return error instanceof Error ? error : new Error(message);
}
