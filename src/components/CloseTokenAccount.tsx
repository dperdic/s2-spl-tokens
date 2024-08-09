import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import { useAppStore } from "../state/store";
import { Transaction } from "@solana/web3.js";
import {
  createBurnCheckedInstruction,
  createCloseAccountInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { confirmTransaction } from "../utils/functions";

export default function CloseTokenAccount() {
  const mint = useAppStore(state => state.mint);
  const tokenBalance = useAppStore(state => state.tokenBalance);
  const setTokenBalance = useAppStore(state => state.setTokenBalance);
  const tokenDecimals = useAppStore(state => state.tokenDecimals);
  const setDelegate = useAppStore(state => state.setDelegate);
  const setDelegatedAmount = useAppStore(state => state.setDelegatedAmount);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const closeTokenAccount = async () => {
    if (!publicKey || !connection) {
      toast.error("Wallet not connected");
      return;
    }

    if (!mint) {
      toast.error("No mint address provided, create a new mint");
      return;
    }

    if (
      tokenBalance &&
      !confirm(
        `Your token account balance is ${tokenBalance}. Closing the account will burn the remaining tokens. Are you sure you want to close your account?`,
      )
    ) {
      return;
    }

    const ata = await getAssociatedTokenAddress(mint, publicKey);

    const transaction = new Transaction();

    if (tokenBalance) {
      console.log("called");
      const burnAmountBigInt = BigInt(tokenBalance * Math.pow(10, tokenDecimals));

      transaction.add(createBurnCheckedInstruction(ata, mint, publicKey, burnAmountBigInt, tokenDecimals));
    }

    transaction.add(createCloseAccountInstruction(ata, publicKey, publicKey));

    const txHash = await sendTransaction(transaction, connection);

    const confirmation = await confirmTransaction(connection, txHash);

    if (confirmation.value.err) {
      toast.error(confirmation.value.err.toString());
    } else {
      toast.info(`Transaction hash: ${txHash}`);

      setTokenBalance(0);
      setDelegate(undefined);
      setDelegatedAmount(0n);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button type="button" className="btn btn-md btn-blue" onClick={closeTokenAccount}>
        Close token account
      </button>
    </div>
  );
}
