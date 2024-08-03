import { FC, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
import { Cluster, clusterApiUrl } from "@solana/web3.js";
import "./WalletContextProvider.css";

const getEndpoint = (): string => {
  const rpcUrl = import.meta.env.VITE_RPC_URL;

  if (!rpcUrl || rpcUrl === "") {
    return clusterApiUrl(import.meta.env.VITE_SOL_CLUSTER as Cluster);
  }

  return rpcUrl;
};

export const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const endpoint = getEndpoint();

  const wallets = useMemo(() => {
    return [new UnsafeBurnerWalletAdapter()];
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
