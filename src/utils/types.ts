export type WalletState = {
  solBalance: number;
};

export interface WalletStateStore {
  walletState: WalletState;
  setWalletState: (newWalletState: WalletState) => void;
}
