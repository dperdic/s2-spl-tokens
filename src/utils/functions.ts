import { Connection, RpcResponseAndContext, SignatureResult } from "@solana/web3.js";

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
