import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { confirmTransaction } from "../utils/functions";
import { toast } from "react-toastify";

export default function Airdrop() {
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
    if (!publicKey) {
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
  };

  return (
    <div className="flex flex-col gap-4 max-w-192">
      <h3 className="text-2xl">SOL</h3>

      <div className="flex flex-col gap-3">
        <div className="text-lg">Balance: {balance} SOL</div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            placeholder="Amount"
            step={0.000000001}
            min={0}
            onChange={event => {
              setAirdropAmount(Number.parseFloat(event.target.value));
            }}
            className="max-w-96 border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
          />

          <div>
            <button type="button" className="btn btn-sm btn-blue" onClick={async () => await requestAirdrop()}>
              Airdrop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
