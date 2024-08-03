import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect } from "react";
import { useWalletStateStore } from "../state/store";
import Solana from "./Solana";
import Token from "./Token";

function Main() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const setWalletState = useWalletStateStore(state => state.setWalletState);

  useEffect(() => {
    if (!connection || !wallet?.publicKey) {
      return;
    }

    connection.onAccountChange(
      wallet.publicKey,
      updatedAccountInfo => {
        setWalletState({ solBalance: updatedAccountInfo.lamports / LAMPORTS_PER_SOL });

        // fetchTokenBalance();
      },
      { commitment: "confirmed" },
    );

    connection.getAccountInfo(wallet.publicKey).then(info => {
      if (info) {
        setWalletState({ solBalance: info.lamports / LAMPORTS_PER_SOL });

        // fetchTokenBalance();
      }
    });
  }, [connection, wallet?.publicKey, setWalletState]);

  return (
    <main className="w-full flex-grow sm:px-16 px-8 py-8">
      {wallet?.publicKey ? (
        <div className="flex flex-col">
          <Solana />
          <Token />
        </div>
      ) : (
        <div>Please connect a wallet</div>
      )}
    </main>
  );
}

export default Main;
