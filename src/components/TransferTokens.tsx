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
import { confirmTransaction } from "../utils/functions";

export default function TransferTokens() {
  const mint = useAppStore(state => state.mint);
  const tokenBalance = useAppStore(state => state.tokenBalance);
  const setTokenBalance = useAppStore(state => state.setTokenBalance);
  const tokenDecimals = useAppStore(state => state.tokenDecimals);

  const [localRecipientAddress, setLocalRecipientAddress] = useState<string>("");
  const [localTransferAmount, setLocalTransferAmount] = useState<string>("");
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const transferTokens = async () => {
    if (!publicKey || !connection) {
      toast.error("Wallet not connected");
      return;
    }

    if (!mint) {
      toast.error("No mint address provided, create a new mint");
      return;
    }

    if (!localRecipientAddress) {
      toast.error("No recipient address provided");
      return;
    }

    let recipientPublicKey: PublicKey;

    try {
      recipientPublicKey = new PublicKey(localRecipientAddress);
    } catch (error) {
      toast.error("Invalid recipient address");
      return;
    }

    if (!localTransferAmount) {
      toast.error("Invalid burn amount");
      return;
    }

    let transferAmountBigInt: bigint;

    try {
      transferAmountBigInt = BigInt(Number.parseFloat(localTransferAmount) * Math.pow(10, tokenDecimals));
    } catch (error) {
      toast.error("Invalid mint amount");
      return;
    }

    const senderAta = await getAssociatedTokenAddress(mint, publicKey);
    const recipientAta = await getAssociatedTokenAddress(mint, recipientPublicKey);

    const transaction = new Transaction();

    try {
      await getAccount(connection, recipientAta);
    } catch (error) {
      transaction.add(createAssociatedTokenAccountInstruction(publicKey, recipientAta, recipientPublicKey, mint));
    }

    transaction.add(
      createTransferCheckedInstruction(senderAta, mint, recipientAta, publicKey, transferAmountBigInt, tokenDecimals),
    );

    const txHash = await sendTransaction(transaction, connection);

    const confirmation = await confirmTransaction(connection, txHash);

    if (confirmation.value.err) {
      toast.error(confirmation.value.err.toString());
    } else {
      toast.info(`Transaction hash: ${txHash}`);

      const tokenAmount = await connection.getTokenAccountBalance(senderAta);

      setTokenBalance(tokenAmount.value.uiAmount ?? 0);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="string"
        placeholder="Recipient address"
        value={localRecipientAddress}
        onChange={event => {
          setLocalRecipientAddress(event.target.value);
        }}
        className="w-full sm:max-w-72 border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
      />

      <input
        type="number"
        placeholder="Amount"
        step={0.000000001}
        min={0}
        max={tokenBalance}
        onChange={event => {
          setLocalTransferAmount(event.target.value);
        }}
        className="w-full sm:max-w-72 border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
      />

      <button type="button" className="btn btn-sm btn-blue" onClick={transferTokens}>
        Transfer tokens
      </button>
    </div>
  );
}
