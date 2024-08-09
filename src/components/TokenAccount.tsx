import {
  getAssociatedTokenAddress,
  createBurnCheckedInstruction,
  createCloseAccountInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { toast } from "react-toastify";
import { useAppStore } from "../state/store";
import { confirmTransaction } from "../utils/functions";

export default function TokenAccount() {
  const transactionInProgress = useAppStore(state => state.transactionInProgress);
  const setTransactionInProgress = useAppStore(state => state.setTransactionInProgress);
  const mint = useAppStore(state => state.mint);
  const ata = useAppStore(state => state.ata);
  const setAta = useAppStore(state => state.setAta);
  const tokenBalance = useAppStore(state => state.tokenBalance);
  const setTokenBalance = useAppStore(state => state.setTokenBalance);
  const tokenDecimals = useAppStore(state => state.tokenDecimals);
  const setDelegate = useAppStore(state => state.setDelegate);
  const setDelegatedAmount = useAppStore(state => state.setDelegatedAmount);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const createTokenAccount = async () => {
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

    const ata = await getAssociatedTokenAddress(mint, publicKey);

    const transaction = new Transaction().add(createAssociatedTokenAccountInstruction(publicKey, ata, publicKey, mint));

    const txHash = await sendTransaction(transaction, connection);

    const confirmation = await confirmTransaction(connection, txHash);

    if (confirmation.value.err) {
      toast.error(confirmation.value.err.toString());
    } else {
      toast.info(`Transaction hash: ${txHash}`);

      setAta(ata);
      setTokenBalance(0);
    }

    setTransactionInProgress(false);
  };

  const closeTokenAccount = async () => {
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
      toast.error("No associated token account, create a token account to mint tokens");
      setTransactionInProgress(false);

      return;
    }

    if (
      tokenBalance &&
      !confirm(
        `Your token account balance is ${tokenBalance}. Closing the account will burn the remaining tokens. Are you sure you want to close your account?`,
      )
    ) {
      setTransactionInProgress(false);

      return;
    }

    const transaction = new Transaction();

    if (tokenBalance) {
      const burnAmountBigInt = BigInt(Math.round(tokenBalance * Math.pow(10, tokenDecimals)));

      transaction.add(createBurnCheckedInstruction(ata, mint, publicKey, burnAmountBigInt, tokenDecimals));
    }

    transaction.add(createCloseAccountInstruction(ata, publicKey, publicKey));

    const txHash = await sendTransaction(transaction, connection);

    const confirmation = await confirmTransaction(connection, txHash);

    if (confirmation.value.err) {
      toast.error(confirmation.value.err.toString());
    } else {
      toast.info(`Transaction hash: ${txHash}`);

      setAta(undefined);
      setTokenBalance(0);
      setDelegate(undefined);
      setDelegatedAmount(0n);
    }

    setTransactionInProgress(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        type="button"
        className="btn btn-md btn-blue"
        disabled={!!ata || transactionInProgress}
        onClick={createTokenAccount}
      >
        Create token account
      </button>

      <button
        type="button"
        className="btn btn-md btn-blue"
        disabled={!ata || transactionInProgress}
        onClick={closeTokenAccount}
      >
        Close token account
      </button>
    </div>
  );
}
