import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";

export default function Header() {
  const [balance, setBalance] = useState(0);
  const { connection } = useConnection();
  const wallet = useWallet();

  useEffect(() => {
    if (!connection || !wallet?.publicKey) {
      return;
    }

    connection.onAccountChange(
      wallet.publicKey,
      updatedAccountInfo => {
        setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);

        // fetchTokenBalance();
      },
      { commitment: "confirmed" },
    );

    connection.getAccountInfo(wallet.publicKey).then(info => {
      if (info) {
        setBalance(info.lamports / LAMPORTS_PER_SOL);

        // fetchTokenBalance();
      }
    });
  }, [connection, wallet?.publicKey]);

  return (
    <header className="flex h-18 w-full bg-white shadow-sm">
      <nav className="flex h-full w-full sm:px-16 px-8 gap-4 items-center justify-between">
        <img src="/vite.svg" alt="vite" className="h-10" />

        <span className="flex flex-row gap-4 items-center">
          {wallet?.publicKey ? `Balance: ${balance} SOL` : ""}

          <WalletMultiButton />
        </span>
      </nav>
    </header>
  );
}
