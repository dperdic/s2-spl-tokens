import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Connection, PublicKey, RpcResponseAndContext, SignatureResult } from "@solana/web3.js";
import { toast } from "react-toastify";

export const confirmTransaction = async (
  connection: Connection,
  tx: string,
): Promise<RpcResponseAndContext<SignatureResult>> => {
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

export const getTokenBalance = async (connection: Connection, mint: PublicKey, walletAddress: PublicKey) => {
  if (!connection) {
    toast.error("Not connected to the rpc endpoint");
    return;
  }

  if (!mint) {
    toast.error("Mint address not provided");
    return;
  }

  if (!walletAddress) {
    toast.error("Wallet is not connected");
    return;
  }

  const ata = await getAssociatedTokenAddress(mint, walletAddress);

  try {
    const balance = await connection.getTokenAccountBalance(ata);

    return balance.value.uiAmountString;
  } catch (error) {
    toast.error(`An error occured while fetching token balance: ${error}`);
  }
};
