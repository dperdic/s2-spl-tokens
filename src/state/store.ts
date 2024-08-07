import { create } from "zustand";
import { PublicKey } from "@solana/web3.js";

export interface AppStore {
  mint: PublicKey | undefined;
  tokenBalance: number;

  setMint: (mint: PublicKey) => void;
  setTokenBalance: (balance: number) => void;
}

export const useAppStore = create<AppStore>(set => ({
  mint: undefined,
  tokenBalance: 0,

  setMint: mint => {
    set(() => ({ mint: mint }));
  },
  setTokenBalance: balance => {
    set(() => ({ tokenBalance: balance }));
  },
}));
