import { create } from "zustand";
import { WalletStateStore } from "../utils/types";

export const useWalletStateStore = create<WalletStateStore>(set => ({
  walletState: {
    solBalance: 0,
  },
  setWalletState: newWalletState => {
    set(() => ({ walletState: newWalletState }));
  },
}));
