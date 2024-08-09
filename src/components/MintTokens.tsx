import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createMintToCheckedInstruction } from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";
import { useState } from "react";
import { useAppStore } from "../state/store";
import { confirmTransaction } from "../utils/functions";
import { toast } from "react-toastify";

export default function MintTokens() {
  const transactionInProgress = useAppStore(state => state.transactionInProgress);
  const setTransactionInProgress = useAppStore(state => state.setTransactionInProgress);
  const mint = useAppStore(state => state.mint);
  const ata = useAppStore(state => state.ata);
  const tokenDecimals = useAppStore(state => state.tokenDecimals);
  const setTokenBalance = useAppStore(state => state.setTokenBalance);
  const [mintAmount, setMintAmount] = useState<string>("");
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const mintTokens = async () => {
    setTransactionInProgress(true);

    if (!publicKey || !connection) {
      toast.error("Wallet not connected");
      setTransactionInProgress(false);

      return;
    }

    if (!mint) {
      toast.error("No mint address provided, create a new mint");
      setTransactionInProgress(false);

      return;
    }

    if (!ata) {
      toast.error("You don't have an associated token account for this token");
      setTransactionInProgress(false);

      return;
    }

    if (!mintAmount) {
      toast.error("Invalid mint amount");
      setTransactionInProgress(false);

      return;
    }

    let mintAmountBigInt: bigint;

    try {
      mintAmountBigInt = BigInt(Math.round(Number(mintAmount) * Math.pow(10, tokenDecimals)));
    } catch (error) {
      toast.error("Invalid mint amount");
      setTransactionInProgress(false);

      return;
    }

    const transaction = new Transaction().add(
      createMintToCheckedInstruction(mint, ata, publicKey, mintAmountBigInt, tokenDecimals),
    );

    const txHash = await sendTransaction(transaction, connection);

    const confirmation = await confirmTransaction(connection, txHash);

    if (confirmation.value.err) {
      toast.error(confirmation.value.err.toString());
    } else {
      toast.info(`Transaction hash: ${txHash}`);

      const tokenAmount = await connection.getTokenAccountBalance(ata);

      setTokenBalance(tokenAmount.value.uiAmount ?? 0);
      setMintAmount("");
    }

    setTransactionInProgress(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="number"
        placeholder="Amount"
        step={Math.pow(10, -1 * tokenDecimals)}
        min={0}
        value={mintAmount}
        onChange={event => {
          setMintAmount(event.target.value);
        }}
        className="w-full border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
      />

      <button
        type="button"
        className="btn btn-md btn-blue"
        disabled={transactionInProgress || !ata || !mintAmount}
        onClick={mintTokens}
      >
        Mint tokens
      </button>
    </div>
  );
}
