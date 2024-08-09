import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { confirmTransaction } from "../utils/functions";
import { toast } from "react-toastify";
import { useAppStore } from "../state/store";

export default function Airdrop() {
  const transactionInProgress = useAppStore(state => state.transactionInProgress);
  const setTransactionInProgress = useAppStore(state => state.setTransactionInProgress);
  const [balance, setBalance] = useState(0);
  const [airdropAmount, setAirdropAmount] = useState(0);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!connection || !publicKey) {
      return;
    }

    connection.onAccountChange(
      publicKey,
      updatedAccountInfo => {
        setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
      },
      { commitment: "confirmed" },
    );

    connection.getAccountInfo(publicKey).then(info => {
      if (info) {
        setBalance(info.lamports / LAMPORTS_PER_SOL);
      }
    });
  }, [connection, publicKey]);

  const requestAirdrop = async () => {
    setTransactionInProgress(true);

    if (!publicKey || !connection) {
      toast.error("Wallet not connected");
      setTransactionInProgress(false);

      return;
    }

    try {
      const tx = await connection.requestAirdrop(publicKey, airdropAmount * LAMPORTS_PER_SOL);

      const confirmation = await confirmTransaction(connection, tx);

      if (confirmation.value.err) {
        toast.error(confirmation.value.err.toString());
      } else {
        toast.info(`Transaction hash: ${tx}`);
      }
    } catch (error) {
      toast.error(error as string);
    }

    setTransactionInProgress(false);
  };

  return (
    <div className="max-w-2xl w-full mx-auto">
      <h3 className="text-xl font-semibold pb-4">SOL</h3>

      <div className="grid gap-4 p-4 bg-white rounded-md shadow w-full">
        <div>Balance: {balance} SOL</div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            placeholder="Amount"
            step={0.000000001}
            min={0}
            onChange={event => {
              setAirdropAmount(Number.parseFloat(event.target.value));
            }}
            className="w-full border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
          />

          <button
            type="button"
            className="btn btn-md btn-blue"
            disabled={transactionInProgress || !airdropAmount}
            onClick={requestAirdrop}
          >
            Airdrop
          </button>
        </div>
      </div>
    </div>
  );
}
