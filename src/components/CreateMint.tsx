import {
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, Transaction, SystemProgram } from "@solana/web3.js";
import { useAppStore } from "../state/store";
import { confirmTransaction } from "../utils/functions";
import { toast } from "react-toastify";
import { useState } from "react";

export default function CreateMint() {
  const transactionInProgress = useAppStore(state => state.transactionInProgress);
  const setTransactionInProgress = useAppStore(state => state.setTransactionInProgress);
  const setMint = useAppStore(state => state.setMint);
  const setTokenDecimals = useAppStore(state => state.setTokenDecimals);
  const [localTokenDecimals, setLocalTokenDecimals] = useState<string>("");
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const createTokenMint = async () => {
    setTransactionInProgress(true);

    if (!publicKey || !connection) {
      toast.error("Wallet not connected");
      setTransactionInProgress(false);

      return;
    }

    if (localTokenDecimals === undefined) {
      toast.error("Number of token decimals not specified");
      setTransactionInProgress(false);

      return;
    }

    let tokenDecimalsNumber: number;

    try {
      tokenDecimalsNumber = Number.parseInt(localTokenDecimals);

      if (tokenDecimalsNumber > 9 || tokenDecimalsNumber < 0) {
        throw new Error();
      }
    } catch (error) {
      toast.error("Invalid number of decimals, valid range is 0-9");
      setTransactionInProgress(false);

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
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        tokenDecimalsNumber,
        publicKey,
        publicKey,
        TOKEN_PROGRAM_ID,
      ),
    );

    const txHash = await sendTransaction(transaction, connection, {
      signers: [mintKeypair],
    });

    const confirmation = await confirmTransaction(connection, txHash);

    if (confirmation.value.err) {
      toast.error(confirmation.value.err.toString());
    } else {
      toast.info(`Transaction hash: ${txHash}`);

      setMint(mintKeypair.publicKey);
      setTokenDecimals(tokenDecimalsNumber);
    }

    setTransactionInProgress(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="number"
          placeholder="Token decimals"
          step={1}
          min={0}
          max={9}
          value={localTokenDecimals}
          onChange={event => {
            setLocalTokenDecimals(event.target.value);
          }}
          className="w-full border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
        />
        <button
          type="button"
          className="btn btn-md btn-blue"
          disabled={transactionInProgress}
          onClick={createTokenMint}
        >
          Create mint
        </button>
      </div>
    </div>
  );
}
