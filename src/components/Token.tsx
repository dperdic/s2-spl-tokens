import {
  Account,
  createAssociatedTokenAccountInstruction,
  createBurnCheckedInstruction,
  createInitializeAccountInstruction,
  createMintToCheckedInstruction,
  getAccount,
  getAccountLenForMint,
  getAssociatedTokenAddress,
  getMint,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  TokenInvalidMintError,
  TokenInvalidOwnerError,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react";
import { TOKEN_DECIMALS } from "../utils/constants";
import { confirmTransaction } from "../utils/functions";
import CreateMint from "./CreateMint";
import { useAppStore } from "../state/store";
import MintTokens from "./MintTokens";
import BurnTokens from "./BurnTokens";

export default function Token() {
  const mint = useAppStore(state => state.mint);
  const [mintAmount, setMintAmount] = useState<string>();
  const [burnAmount, setBurnAmount] = useState<string>();

  const [senderAddress, setSenderAddress] = useState<string>();
  const [recipientAddress, setRecipientAddress] = useState<string>();

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const createTokenAccount = async () => {
    if (!publicKey || !connection || !mint) {
      return;
    }

    const mintState = await getMint(connection, mint);
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
      createInitializeAccountInstruction(associatedTokenKeyPair.publicKey, mint, publicKey, TOKEN_PROGRAM_ID),
    );

    const txHash = await sendTransaction(tx, connection, {
      signers: [associatedTokenKeyPair],
    });

    console.log("Transaction hash: ", txHash);
  };

  const getOrCreateAta = async () => {
    if (!publicKey || !connection || !mint) {
      return;
    }

    const associatedToken = await getAssociatedTokenAddress(mint, publicKey);

    let account: Account;

    try {
      account = await getAccount(connection, associatedToken);
    } catch (error: unknown) {
      if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
        // As this isn't atomic, it's possible others can create associated accounts meanwhile.
        try {
          const tx = new Transaction().add(
            createAssociatedTokenAccountInstruction(publicKey, associatedToken, publicKey, mint),
          );

          const txHash = await sendTransaction(tx, connection);

          await confirmTransaction(connection, txHash);

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

    if (!account.mint.equals(mint)) throw new TokenInvalidMintError();
    if (!account.owner.equals(publicKey)) throw new TokenInvalidOwnerError();

    console.log(account);
  };

  const mintTokens = async () => {
    if (!publicKey || !connection || !mint || !mintAmount) {
      return;
    }

    let mintAmountNumber: number;

    try {
      mintAmountNumber = Number.parseInt(mintAmount);
    } catch (error) {
      console.log("Invalid mint amount");
      return;
    }

    const associatedToken = await getAssociatedTokenAddress(mint, publicKey);

    const transaction = new Transaction().add(
      createMintToCheckedInstruction(mint, associatedToken, publicKey, mintAmountNumber, TOKEN_DECIMALS),
    );

    const txHash = await sendTransaction(transaction, connection);

    await confirmTransaction(connection, txHash);

    console.log("Transaction hash: ", txHash);

    const account = await getAccount(connection, associatedToken);

    console.log("Balance: ", account.amount);
  };

  const burnTokens = async () => {
    if (!publicKey || !connection || !mint || !burnAmount) {
      return;
    }

    let burnAmountNumber: number;

    try {
      burnAmountNumber = Number.parseInt(burnAmount);
    } catch (error) {
      console.log("Invalid burn amount");
      return;
    }

    const associatedToken = await getAssociatedTokenAddress(mint, publicKey);

    const transaction = new Transaction().add(
      createBurnCheckedInstruction(associatedToken, mint, publicKey, burnAmountNumber, TOKEN_DECIMALS),
    );

    const txHash = await sendTransaction(transaction, connection);

    await confirmTransaction(connection, txHash);

    console.log("Transaction hash: ", txHash);

    const account = await getAccount(connection, associatedToken);

    console.log("Balance: ", account.amount);
  };

  const transferTokens = async () => {
    if (!publicKey || !connection || !mint || !senderAddress || !recipientAddress) {
      return;
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-192">
      <h3 className="text-2xl">Token</h3>

      <div className="flex flex-col gap-6">
        <CreateMint />

        {mint && (
          <>
            <MintTokens />
            <BurnTokens />
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
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

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            className="btn btn-sm btn-blue"
            onClick={async () => {
              await getOrCreateAta();
            }}
          >
            Create ATA
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            placeholder="Amount"
            step={1}
            min={0}
            onChange={event => {
              setMintAmount(event.target.value);
            }}
            className="w-full sm:max-w-72 border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
          />

          <button
            type="button"
            className="btn btn-sm btn-blue"
            onClick={async () => {
              await mintTokens();
            }}
          >
            Mint
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            placeholder="Amount"
            step={0.000000001}
            min={0}
            onChange={event => {
              setBurnAmount(event.target.value);
            }}
            className="w-full sm:max-w-72 border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
          />

          <button
            type="button"
            className="btn btn-sm btn-blue"
            onClick={async () => {
              await burnTokens();
            }}
          >
            Burn
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="string"
            placeholder="Sender address"
            value={senderAddress}
            onChange={event => {
              setSenderAddress(event.target.value);
            }}
            className="w-full sm:max-w-72 border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
          />

          <input
            type="string"
            placeholder="Recipient address"
            value={recipientAddress}
            onChange={event => {
              setRecipientAddress(event.target.value);
            }}
            className="w-full sm:max-w-72 border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
          />

          <button
            type="button"
            className="btn btn-sm btn-blue"
            onClick={async () => {
              await transferTokens();
            }}
          >
            Transfer tokens
          </button>
        </div>

        {/* <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            placeholder="Amount"
            step={0.000000001}
            min={0}
            onChange={() => {}}
            className="w-full sm:max-w-72 border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
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
