import {
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, Transaction, SystemProgram } from "@solana/web3.js";
import { TOKEN_DECIMALS } from "../utils/constants";
import { useAddressStore } from "../state/store";
import { confirmTransaction } from "../utils/functions";
import { toast } from "react-toastify";

export default function CreateMint() {
  const addresses = useAddressStore(state => state.addresses);
  const setAddresses = useAddressStore(state => state.setAddresses);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const createTokenMint = async () => {
    if (!publicKey || !connection) {
      return;
    }

    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    const mint = Keypair.generate();

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(mint.publicKey, TOKEN_DECIMALS, publicKey, publicKey, TOKEN_PROGRAM_ID),
    );

    const tx = await sendTransaction(transaction, connection, {
      signers: [mint],
    });

    const confirmation = await confirmTransaction(connection, tx);

    if (confirmation.value.err) {
      toast.error(confirmation.value.err.toString());
    } else {
      toast.info(`Transaction hash: ${tx}`);

      setAddresses({ ...addresses, mintAddress: mint.publicKey });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="break-words">Mint address: {addresses.mintAddress?.toBase58()}</div>

      <div>
        <button type="button" className="btn btn-sm btn-blue" onClick={createTokenMint}>
          Create mint
        </button>
      </div>
    </div>
  );
}
