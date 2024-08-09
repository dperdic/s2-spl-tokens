import { useWallet } from "@solana/wallet-adapter-react";
import { Slide, ToastContainer } from "react-toastify";
import Airdrop from "./Airdrop";
import Token from "./Token";
import "react-toastify/dist/ReactToastify.css";

export default function Main() {
  const { publicKey } = useWallet();

  return (
    <main className="w-full flex-grow sm:px-16 px-8 py-8 mt-18">
      {publicKey ? (
        <div className="flex flex-col gap-12">
          <Airdrop />
          <Token />
        </div>
      ) : (
        <div>Please connect a wallet</div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
      />
    </main>
  );
}
