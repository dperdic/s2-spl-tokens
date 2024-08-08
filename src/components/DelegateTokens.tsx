import { useState } from "react";
import { useAppStore } from "../state/store";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { toast } from "react-toastify";
import {
  createApproveCheckedInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { confirmTransaction } from "../utils/functions";

export default function DelegateTokens() {
  const mint = useAppStore(state => state.mint);
  const tokenDecimals = useAppStore(state => state.tokenDecimals);
  const tokenBalance = useAppStore(state => state.tokenBalance);
  const setDelegate = useAppStore(state => state.setDelegate);
  const setDelegatedAmount = useAppStore(state => state.setDelegatedAmount);

  const [localDelegateAddress, setLocalDelegateAddress] = useState<string>("");
  const [localDelegateAmount, setLocalDelegateAmount] = useState<string>("");

  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const delegateTokens = async () => {
    if (!publicKey || !connection) {
      toast.error("Wallet not connected");
      return;
    }

    if (!mint) {
      toast.error("No mint address provided, create a new mint");
      return;
    }

    if (!localDelegateAddress) {
      toast.error("No recipient address provided");
      return;
    }

    let delegatePublicKey: PublicKey;

    try {
      delegatePublicKey = new PublicKey(localDelegateAddress);
    } catch (error) {
      toast.error("Invalid recipient address");
      return;
    }

    if (!localDelegateAmount) {
      toast.error("Invalid burn amount");
      return;
    }

    let delegateAmountBigInt: bigint;

    try {
      delegateAmountBigInt = BigInt(Number.parseFloat(localDelegateAmount) * Math.pow(10, tokenDecimals));
    } catch (error) {
      toast.error("Invalid mint amount");
      return;
    }

    const senderAta = await getAssociatedTokenAddress(mint, publicKey);
    const recipientAta = await getAssociatedTokenAddress(mint, delegatePublicKey);

    const transaction = new Transaction();

    try {
      await getAccount(connection, recipientAta);
    } catch (error) {
      transaction.add(createAssociatedTokenAccountInstruction(publicKey, recipientAta, delegatePublicKey, mint));
    }

    transaction.add(
      createApproveCheckedInstruction(senderAta, mint, recipientAta, publicKey, delegateAmountBigInt, tokenDecimals),
    );

    const txHash = await sendTransaction(transaction, connection);

    const confirmation = await confirmTransaction(connection, txHash);

    if (confirmation.value.err) {
      toast.error(confirmation.value.err.toString());
    } else {
      toast.info(`Transaction hash: ${txHash}`);

      const account = await getAccount(connection, senderAta);

      setDelegate(account.delegate ?? undefined);
      setDelegatedAmount(account.delegatedAmount);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="string"
        placeholder="Delegate address"
        value={localDelegateAddress}
        onChange={event => {
          setLocalDelegateAddress(event.target.value);
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
          setLocalDelegateAmount(event.target.value);
        }}
        className="w-full sm:max-w-72 border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
      />

      <button type="button" className="btn btn-sm btn-blue" onClick={delegateTokens}>
        Delegate tokens
      </button>
    </div>
  );
}
