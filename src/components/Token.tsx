import {
  Account,
  createAssociatedTokenAccountInstruction,
  createInitializeAccountInstruction,
  createInitializeMintInstruction,
  getAccount,
  getAccountLenForMint,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  getMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  TokenInvalidMintError,
  TokenInvalidOwnerError,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  RpcResponseAndContext,
  SignatureResult,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useState } from "react";

export default function Token() {
  const [mintAddress, setMintAddress] = useState<PublicKey | null>(null);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const createTokenMint = async () => {
    if (!publicKey || !connection) {
      return;
    }

    const mint = Keypair.generate();
    setMintAddress(mint.publicKey);

    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    console.log("lamports: ", lamports);
    console.log("sol: ", lamports / LAMPORTS_PER_SOL);

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(mint.publicKey, 9, publicKey, publicKey, TOKEN_PROGRAM_ID),
    );

    const tx = await sendTransaction(transaction, connection, {
      signers: [mint],
    });

    console.log(tx);
    console.log(mintAddress);
  };

  const createTokenAccount = async () => {
    if (!publicKey || !connection || !mintAddress) {
      return;
    }

    const mintState = await getMint(connection, mintAddress);
    const space = getAccountLenForMint(mintState);
    const lamports = await connection.getMinimumBalanceForRentExemption(space);

    const associatedTokenKeyPair = Keypair.generate();

    const tx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: associatedTokenKeyPair.publicKey,
        space: space,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeAccountInstruction(associatedTokenKeyPair.publicKey, mintAddress, publicKey, TOKEN_PROGRAM_ID),
    );

    const txHash = await sendTransaction(tx, connection, {
      signers: [associatedTokenKeyPair],
    });

    console.log("Transaction hash: ", txHash);
  };

  const createAta = async () => {
    if (!publicKey || !connection || !mintAddress) {
      return;
    }

    const associatedToken = await getAssociatedTokenAddress(mintAddress, publicKey);

    let account: Account;

    try {
      account = await getAccount(connection, associatedToken);
    } catch (error: unknown) {
      if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
        // As this isn't atomic, it's possible others can create associated accounts meanwhile.
        try {
          const tx = new Transaction().add(
            createAssociatedTokenAccountInstruction(publicKey, associatedToken, publicKey, mintAddress),
          );

          const txHash = await sendTransaction(tx, connection);

          await confirmTransaction(txHash);

          console.log(txHash);
        } catch (error: unknown) {
          // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
          // instruction error if the associated account exists already.
        }

        // Now this should always succeed
        account = await getAccount(connection, associatedToken);

        console.log("getAccount: ", account);
        // console.log("getAccount: ", account);
      } else {
        console.log(error as string);

        return;
      }
    }

    if (!account.mint.equals(mintAddress)) throw new TokenInvalidMintError();
    if (!account.owner.equals(publicKey)) throw new TokenInvalidOwnerError();

    console.log(account);
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
      <h3 className="text-2xl">Token</h3>

      <div className="flex flex-col gap-3">
        <div>Balance: {} SOL</div>

        <div className="flex flex-row gap-3">
          <button
            type="button"
            className="btn btn-sm btn-blue"
            onClick={async () => {
              await createTokenMint();
            }}
          >
            Create mint
          </button>
        </div>

        <div className="flex flex-row gap-3">
          <button
            type="button"
            className="btn btn-sm btn-blue"
            onClick={async () => {
              await createTokenAccount();
            }}
          >
            Create mint account
          </button>
        </div>

        <div className="flex flex-row gap-3">
          <button
            type="button"
            className="btn btn-sm btn-blue"
            onClick={async () => {
              await createAta();
            }}
          >
            Create ATA
          </button>
        </div>

        {/* <div className="flex flex-row gap-3">
          <input
            type="number"
            placeholder="Amount"
            step={0.000000001}
            min={0}
            onChange={() => {}}
            className="max-w-96 border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
          />

          <button type="button" className="btn btn-sm btn-blue" onClick={async () => {}}>
            Airdrop
          </button>
        </div> */}

        {/* {response && <div className={`break-words ${response.isError ? "text-red-500" : ""}}`}>{response.message}</div>} */}
      </div>
    </div>
  );
}
