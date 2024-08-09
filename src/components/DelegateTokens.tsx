import { useState } from "react";
import { useAppStore } from "../state/store";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { toast } from "react-toastify";
import {
  createApproveCheckedInstruction,
  createAssociatedTokenAccountInstruction,
  createRevokeInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { confirmTransaction } from "../utils/functions";

export default function DelegateTokens() {
  const transactionInProgress = useAppStore(state => state.transactionInProgress);
  const setTransactionInProgress = useAppStore(state => state.setTransactionInProgress);
  const mint = useAppStore(state => state.mint);
  const ata = useAppStore(state => state.ata);
  const tokenDecimals = useAppStore(state => state.tokenDecimals);
  const tokenBalance = useAppStore(state => state.tokenBalance);
  const delegate = useAppStore(state => state.delegate);
  const setDelegate = useAppStore(state => state.setDelegate);
  const setDelegatedAmount = useAppStore(state => state.setDelegatedAmount);

  const [localDelegateAddress, setLocalDelegateAddress] = useState<string>("");
  const [delegateAmount, setDelegateAmount] = useState<string>("");

  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const delegateTokens = async () => {
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

    if (!localDelegateAddress) {
      toast.error("No recipient address provided");
      setTransactionInProgress(false);

      return;
    }

    let delegatePublicKey: PublicKey;

    try {
      delegatePublicKey = new PublicKey(localDelegateAddress);
    } catch (error) {
      toast.error("Invalid recipient address");
      setTransactionInProgress(false);

      return;
    }

    if (!delegateAmount) {
      toast.error("Invalid delegate amount");
      setTransactionInProgress(false);

      return;
    }

    let delegateAmountBigInt: bigint;

    try {
      delegateAmountBigInt = BigInt(Math.round(Number(delegateAmount) * Math.pow(10, tokenDecimals)));
    } catch (error) {
      toast.error("Invalid delegate amount");
      setTransactionInProgress(false);

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

      setLocalDelegateAddress("");
      setDelegateAmount("");
    }

    setTransactionInProgress(false);
  };

  const revokeDelegate = async () => {
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

    if (!delegate) {
      toast.error("Your token account doesn't have a delegate");
      setTransactionInProgress(false);

      return;
    }

    const transaction = new Transaction().add(createRevokeInstruction(ata, publicKey));

    const txHash = await sendTransaction(transaction, connection);

    const confirmation = await confirmTransaction(connection, txHash);

    if (confirmation.value.err) {
      toast.error(confirmation.value.err.toString());
    } else {
      toast.info(`Transaction hash: ${txHash}`);

      const senderAta = await getAssociatedTokenAddress(mint, publicKey);

      const account = await getAccount(connection, senderAta);

      setDelegate(account.delegate ?? undefined);
      setDelegatedAmount(account.delegatedAmount);
    }

    setTransactionInProgress(false);
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
        className="w-full border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
      />

      <input
        type="number"
        placeholder="Amount"
        step={Math.pow(10, -1 * tokenDecimals)}
        min={0}
        max={tokenBalance}
        value={delegateAmount}
        onChange={event => {
          setDelegateAmount(event.target.value);
        }}
        className="w-full border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
      />

      <button
        type="button"
        className="btn btn-md btn-blue"
        disabled={transactionInProgress || !ata || !localDelegateAddress || !delegateAmount}
        onClick={delegateTokens}
      >
        Delegate tokens
      </button>

      <button
        type="button"
        className="btn btn-md btn-blue"
        disabled={transactionInProgress || !delegate}
        onClick={revokeDelegate}
      >
        Revoke delegate
      </button>
    </div>
  );
}
