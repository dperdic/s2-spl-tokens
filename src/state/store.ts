import { create } from "zustand";
import { PublicKey } from "@solana/web3.js";

export interface AppStore {
  mint: PublicKey | undefined;
  tokenDecimals: number;
  tokenBalance: number;

  setMint: (mint: PublicKey) => void;
  setTokenDecimals: (decimals: number) => void;
  setTokenBalance: (balance: number) => void;
}

export const useAppStore = create<AppStore>(set => ({
  mint: undefined,
  tokenDecimals: 0,
  tokenBalance: 0,

  setMint: mint => {
    set(() => ({ mint: mint }));
  },
  setTokenDecimals: decimals => {
    set(() => ({ tokenDecimals: decimals }));
  },
  setTokenBalance: balance => {
    set(() => ({ tokenBalance: balance }));
  },
}));
