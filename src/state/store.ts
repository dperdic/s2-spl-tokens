import { create } from "zustand";
import { WalletStateStore } from "../utils/types";

export const useAddressStore = create<WalletStateStore>(set => ({
  addresses: {
    mintAddress: undefined,
  },
  setAddresses: newWalletState => {
    set(() => ({ addresses: newWalletState }));
  },
}));
