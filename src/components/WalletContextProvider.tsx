import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import "./WalletContextProvider.css";
import { Cluster, clusterApiUrl } from "@solana/web3.js";

export const WalletContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const endpoint =
    import.meta.env.VITE_RPC_URL ??
    clusterApiUrl(import.meta.env.VITE_SOL_CLUSTER as Cluster);
  const wallets = useMemo(() => {
    return [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
