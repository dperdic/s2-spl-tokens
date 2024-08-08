import { toast } from "react-toastify";
import { useAppStore } from "../state/store";
import { Transaction } from "@solana/web3.js";
import { createRevokeInstruction, getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { confirmTransaction } from "../utils/functions";

export default function RevokeDelegate() {
  const mint = useAppStore(state => state.mint);
  const delegate = useAppStore(state => state.delegate);
  const setDelegate = useAppStore(state => state.setDelegate);
  const setDelegatedAmount = useAppStore(state => state.setDelegatedAmount);

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const revokeDelegate = async () => {
    if (!publicKey || !connection) {
      toast.error("Wallet not connected");
      return;
    }

    if (!mint) {
      toast.error("No mint address provided, create a new mint");
      return;
    }

    if (!delegate) {
      toast.error("Your token account doesn't have a delegate");
      return;
    }

    const ata = await getAssociatedTokenAddress(mint, publicKey);

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
  };

  return (
    <div className="flex flex-col gap-3">
      <button type="button" className="btn btn-sm btn-blue" disabled={!delegate} onClick={revokeDelegate}>
        Revoke delegate
      </button>
    </div>
  );
}
