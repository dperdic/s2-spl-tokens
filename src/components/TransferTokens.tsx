import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAppStore } from "../state/store";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  getAccount,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { confirmTransaction, getStep } from "../utils/functions";

export default function TransferTokens() {
  const transactionInProgress = useAppStore(state => state.transactionInProgress);
  const setTransactionInProgress = useAppStore(state => state.setTransactionInProgress);
  const mint = useAppStore(state => state.mint);
  const ata = useAppStore(state => state.ata);
  const tokenBalance = useAppStore(state => state.tokenBalance);
  const setTokenBalance = useAppStore(state => state.setTokenBalance);
  const tokenDecimals = useAppStore(state => state.tokenDecimals);

  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const transferTokens = async () => {
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
      toast.error("No associated token account");
      setTransactionInProgress(false);

      return;
    }

    if (!recipientAddress) {
      toast.error("No recipient address provided");
      setTransactionInProgress(false);

      return;
    }

    let recipientPublicKey: PublicKey;

    try {
      recipientPublicKey = new PublicKey(recipientAddress);
    } catch (error) {
      toast.error("Invalid recipient address");
      setTransactionInProgress(false);

      return;
    }

    if (!transferAmount) {
      toast.error("Invalid transfer amount");
      setTransactionInProgress(false);

      return;
    }

    let transferAmountBigInt: bigint;

    try {
      transferAmountBigInt = BigInt(Math.round(Number(transferAmount) * Math.pow(10, tokenDecimals)));
    } catch (error) {
      toast.error("Invalid transfer amount");
      return;
    }

    const recipientAta = await getAssociatedTokenAddress(mint, recipientPublicKey);

    const transaction = new Transaction();

    try {
      await getAccount(connection, recipientAta);
    } catch (error) {
      transaction.add(createAssociatedTokenAccountInstruction(publicKey, recipientAta, recipientPublicKey, mint));
    }

    transaction.add(
      createTransferCheckedInstruction(ata, mint, recipientAta, publicKey, transferAmountBigInt, tokenDecimals),
    );

    const txHash = await sendTransaction(transaction, connection);

    const confirmation = await confirmTransaction(connection, txHash);

    if (confirmation.value.err) {
      toast.error(confirmation.value.err.toString());
    } else {
      toast.info(`Transaction hash: ${txHash}`);

      const tokenAmount = await connection.getTokenAccountBalance(ata);

      setTokenBalance(tokenAmount.value.uiAmount ?? 0);
      setRecipientAddress("");
      setTransferAmount("");
    }

    setTransactionInProgress(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="string"
        placeholder="Recipient address"
        value={recipientAddress}
        onChange={event => {
          setRecipientAddress(event.target.value);
        }}
        className="w-full border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
      />

      <input
        type="number"
        placeholder="Amount"
        step={getStep(tokenDecimals)}
        min={0}
        max={tokenBalance}
        value={transferAmount}
        onChange={event => {
          setTransferAmount(event.target.value);
        }}
        className="w-full border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
      />

      <button
        type="button"
        className="btn btn-md btn-blue"
        disabled={transactionInProgress || !ata || !transferAmount || !recipientAddress}
        onClick={transferTokens}
      >
        Transfer tokens
      </button>
    </div>
  );
}
