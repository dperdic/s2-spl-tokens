import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, RpcResponseAndContext, SignatureResult } from "@solana/web3.js";
import { TransactionResponse } from "../utils/types";

export default function Airdrop() {
  const [balance, setBalance] = useState(0);
  const [airdropAmount, setAirdropAmount] = useState(0);
  const [response, setResponse] = useState<TransactionResponse | null>({
    isError: false,
    message: "",
  });
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
    if (publicKey) {
      try {
        const tx = await connection.requestAirdrop(publicKey, airdropAmount * LAMPORTS_PER_SOL);

        const confirmation = await confirmTransaction(tx);

        if (confirmation.value.err) {
          setResponse({
            isError: true,
            message: confirmation.value.err.toString(),
          });
        } else {
          setResponse({
            isError: false,
            message: `Transaction hash: ${tx}`,
          });
        }
      } catch (error) {
        setResponse({
          isError: true,
          message: error as string,
        });
      }
    }
  };

  const confirmTransaction = async (tx: string): Promise<RpcResponseAndContext<SignatureResult>> => {
    const bh = await connection.getLatestBlockhash();

    return await connection.confirmTransaction(
      {
        signature: tx,
        blockhash: bh.blockhash,
        lastValidBlockHeight: bh.lastValidBlockHeight,
      },
      "confirmed",
    );
  };

  return (
    <div className="flex flex-col gap-4 max-w-192">
      <h3 className="text-2xl">SOL</h3>

      <div className="flex flex-col gap-3">
        <div>Balance: {balance} SOL</div>

        <div className="flex flex-row gap-3">
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

          <button type="button" className="btn btn-sm btn-blue" onClick={async () => await requestAirdrop()}>
            Airdrop
          </button>
        </div>

        {response && <div className={`break-words ${response.isError ? "text-red-500" : ""}}`}>{response.message}</div>}
      </div>
    </div>
  );
}
