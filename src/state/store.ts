import { create } from "zustand";
import { PublicKey } from "@solana/web3.js";

export interface AppStore {
  mint: PublicKey | undefined;
  tokenDecimals: number;
  tokenBalance: number;
  delegate: PublicKey | undefined;
  delegatedAmount: bigint;

  setMint: (mint: PublicKey) => void;
  setTokenDecimals: (decimals: number) => void;
  setTokenBalance: (balance: number) => void;
  setDelegate: (delegate: PublicKey | undefined) => void;
  setDelegatedAmount: (delegatedAmount: bigint) => void;
}

export const useAppStore = create<AppStore>(set => ({
  mint: undefined,
  tokenDecimals: 0,
  tokenBalance: 0,
  delegate: undefined,
  delegatedAmount: 0n,

  setMint: mint => set(() => ({ mint: mint })),
  setTokenDecimals: decimals => set(() => ({ tokenDecimals: decimals })),
  setTokenBalance: balance => set(() => ({ tokenBalance: balance })),
  setDelegate: delegate => set(() => ({ delegate: delegate })),
  setDelegatedAmount: delegatedAmount => set(() => ({ delegatedAmount: delegatedAmount })),
}));
