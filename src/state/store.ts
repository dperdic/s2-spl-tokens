import { create } from "zustand";
import { PublicKey } from "@solana/web3.js";

export interface AppStore {
  mint: PublicKey | undefined;
  ata: PublicKey | undefined;
  tokenDecimals: number;
  tokenBalance: number;
  delegateAccount: PublicKey | undefined;
  delegateTokenAccount: PublicKey | undefined;
  delegatedAmount: bigint;
  transactionInProgress: boolean;

  setMint: (mint: PublicKey) => void;
  setAta: (ata: PublicKey | undefined) => void;
  setTokenDecimals: (decimals: number) => void;
  setTokenBalance: (balance: number) => void;
  setDelegateAccount: (delegateAccount: PublicKey | undefined) => void;
  setDelegateTokenAccount: (delegateTokenAccount: PublicKey | undefined) => void;
  setDelegatedAmount: (delegatedAmount: bigint) => void;
  setTransactionInProgress: (inProgress: boolean) => void;
}

export const useAppStore = create<AppStore>(set => ({
  mint: undefined,
  ata: undefined,
  tokenDecimals: 0,
  tokenBalance: 0,
  delegateAccount: undefined,
  delegateTokenAccount: undefined,
  delegatedAmount: 0n,
  transactionInProgress: false,

  setMint: mint => set(() => ({ mint: mint })),
  setAta: ata => set(() => ({ ata: ata })),
  setTokenDecimals: decimals => set(() => ({ tokenDecimals: decimals })),
  setTokenBalance: balance => set(() => ({ tokenBalance: balance })),
  setDelegateAccount: delegateAccount => set(() => ({ delegateAccount: delegateAccount })),
  setDelegateTokenAccount: delegateTokenAccount => set(() => ({ delegateTokenAccount: delegateTokenAccount })),
  setDelegatedAmount: delegatedAmount => set(() => ({ delegatedAmount: delegatedAmount })),
  setTransactionInProgress: inProgress => set(() => ({ transactionInProgress: inProgress })),
}));
