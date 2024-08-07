import {
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, Transaction, SystemProgram } from "@solana/web3.js";
import { TOKEN_DECIMALS } from "../utils/constants";
import { useAppStore } from "../state/store";
import { confirmTransaction } from "../utils/functions";
import { toast } from "react-toastify";

export default function CreateMint() {
  const mint = useAppStore(state => state.mint);
  const setMint = useAppStore(state => state.setMint);
  const tokenBalance = useAppStore(state => state.tokenBalance);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const createTokenMint = async () => {
    if (!publicKey || !connection) {
      toast.error("Wallet not connected");
      return;
    }

    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    const mintKeypair = Keypair.generate();

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(mintKeypair.publicKey, TOKEN_DECIMALS, publicKey, publicKey, TOKEN_PROGRAM_ID),
    );

    const tx = await sendTransaction(transaction, connection, {
      signers: [mintKeypair],
    });

    const confirmation = await confirmTransaction(connection, tx);

    if (confirmation.value.err) {
      toast.error(confirmation.value.err.toString());
    } else {
      toast.info(`Transaction hash: ${tx}`);

      setMint(mintKeypair.publicKey);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {mint ? (
        <div>
          <div className="break-words">Mint address: {mint?.toBase58()}</div>
          <div>Token balance: {tokenBalance}</div>
        </div>
      ) : (
        <div>
          <button type="button" className="btn btn-sm btn-blue" onClick={createTokenMint}>
            Create mint
          </button>
        </div>
      )}
    </div>
  );
}
