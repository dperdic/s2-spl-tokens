import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  getAssociatedTokenAddress,
  createMintToCheckedInstruction,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";
import { useState } from "react";
import { useAppStore } from "../state/store";
import { TOKEN_DECIMALS } from "../utils/constants";
import { confirmTransaction } from "../utils/functions";
import { toast } from "react-toastify";

export default function MintTokens() {
  const mint = useAppStore(state => state.mint);
  const setTokenBalance = useAppStore(state => state.setTokenBalance);
  const [mintAmount, setMintAmount] = useState<string>();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const mintTokens = async () => {
    if (!publicKey || !connection) {
      toast.error("Wallet not connected");
      return;
    }

    if (!mint) {
      toast.error("No mint address provided, create a new mint");
      return;
    }

    if (!mintAmount) {
      toast.error("Invalid mint amount");
      return;
    }

    let mintAmountBigInt: bigint;

    try {
      mintAmountBigInt = BigInt(Number.parseFloat(mintAmount) * Math.pow(10, TOKEN_DECIMALS));
    } catch (error) {
      toast.error("Invalid mint amount");
      return;
    }

    const ata = await getAssociatedTokenAddress(mint, publicKey);

    const transaction = new Transaction();

    try {
      await getAccount(connection, ata);
    } catch (error) {
      transaction.add(createAssociatedTokenAccountInstruction(publicKey, ata, publicKey, mint));
    }

    transaction.add(createMintToCheckedInstruction(mint, ata, publicKey, mintAmountBigInt, TOKEN_DECIMALS));

    const txHash = await sendTransaction(transaction, connection);

    const confirmation = await confirmTransaction(connection, txHash);

    if (confirmation.value.err) {
      toast.error(confirmation.value.err.toString());
    } else {
      toast.info(`Transaction hash: ${txHash}`);

      const account = await getAccount(connection, ata);

      const balance = Number(account.amount) / Math.pow(10, TOKEN_DECIMALS);

      setTokenBalance(balance);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="number"
        placeholder="Amount"
        step={0.000000001}
        min={0}
        onChange={event => {
          setMintAmount(event.target.value);
        }}
        className="w-full sm:max-w-72 border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
      />

      <button
        type="button"
        className="btn btn-sm btn-blue"
        onClick={async () => {
          await mintTokens();
        }}
      >
        Mint
      </button>
    </div>
  );
}
