import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect } from "react";

export default function Header() {
  const { connection } = useConnection();
  const wallet = useWallet();

  useEffect(() => {
    if (!connection || !wallet?.publicKey) {
      return;
    }

    connection.onAccountChange(
      wallet.publicKey,
      () => {
        // fetchTokenBalance();
      },
      { commitment: "confirmed" }
    );

    connection.getAccountInfo(wallet.publicKey).then((info) => {
      if (info) {
        // fetchTokenBalance();
      }
    });
  }, [connection, wallet?.publicKey]);

  return (
    <header className="flex h-18 w-full sm:px-16 px-8 gap-4 items-center justify-between bg-white shadow-sm">
      <nav className="flex h-full w-full px-8 gap-4 items-center justify-between">
        <img src="/vite.svg" alt="vite" className="h-10" />

        <WalletMultiButton></WalletMultiButton>
      </nav>
    </header>
  );
}
