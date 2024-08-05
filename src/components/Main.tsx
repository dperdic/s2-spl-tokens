import { useWallet } from "@solana/wallet-adapter-react";
import Airdrop from "./Airdrop";
import Token from "./Token";

function Main() {
  const { publicKey } = useWallet();

  return (
    <main className="w-full flex-grow sm:px-16 px-8 py-8 mt-18">
      {publicKey ? (
        <div className="flex flex-col gap-8">
          <Airdrop />
          <Token />
        </div>
      ) : (
        <div>Please connect a wallet</div>
      )}
    </main>
  );
}

export default Main;
