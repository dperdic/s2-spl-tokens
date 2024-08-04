import { useWallet } from "@solana/wallet-adapter-react";
import Solana from "./Solana";
import Token from "./Token";

function Main() {
  const { publicKey } = useWallet();

  return (
    <main className="w-full flex-grow sm:px-16 px-8 py-8">
      {publicKey ? (
        <div className="flex flex-col gap-12">
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
