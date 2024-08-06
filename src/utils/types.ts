import { PublicKey } from "@solana/web3.js";

export type Addresses = {
  mintAddress: PublicKey | undefined;
};

export interface WalletStateStore {
  addresses: Addresses;
  setAddresses: (newAddresses: Addresses) => void;
}
