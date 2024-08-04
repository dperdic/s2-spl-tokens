import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react";

export default function Token() {
  const [mintAddress, setMintAddress] = useState<PublicKey | null>(null);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const createTokenMint = async () => {
    if (!publicKey || !connection) {
      return;
    }

    const mint = Keypair.generate();
    setMintAddress(mint.publicKey);

    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    console.log("lamports: ", lamports);
    console.log("sol: ", lamports / LAMPORTS_PER_SOL);

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(mint.publicKey, 9, publicKey, publicKey, TOKEN_PROGRAM_ID),
    );

    const tx = await sendTransaction(transaction, connection, {
      signers: [mint],
    });

    console.log(tx);
    console.log(mintAddress);
  };

  return (
    <div className="flex flex-col gap-4 max-w-192">
      <h3 className="text-2xl">Token</h3>

      <div className="flex flex-col gap-3">
        <div>Balance: {} SOL</div>

        <div className="flex flex-row gap-3">
          <button
            type="button"
            className="btn btn-sm btn-blue"
            onClick={async () => {
              await createTokenMint();
            }}
          >
            Create mint
          </button>
        </div>

        {/* <div className="flex flex-row gap-3">
          <input
            type="number"
            placeholder="Amount"
            step={0.000000001}
            min={0}
            onChange={() => {}}
            className="max-w-96 border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
          />

          <button type="button" className="btn btn-sm btn-blue" onClick={async () => {}}>
            Airdrop
          </button>
        </div> */}

        {/* {response && <div className={`break-words ${response.isError ? "text-red-500" : ""}}`}>{response.message}</div>} */}
      </div>
    </div>
  );
}
