import { useWallet } from "@solana/wallet-adapter-react";
import { Slide, ToastContainer } from "react-toastify";
import Airdrop from "./Airdrop";
import Token from "./Token";
import "react-toastify/dist/ReactToastify.css";

export default function Main() {
  const { publicKey } = useWallet();

  return (
    <main
      className={`w-full flex-grow flex-grow sm:px-16 px-8 py-8 mt-18 ${
        !publicKey && "flex items-center justify-center"
      }}`}
    >
      {publicKey ? (
        <div className="flex flex-col gap-12">
          <Airdrop />
          <Token />
        </div>
      ) : (
        <div className="w-full max-w-2xl mx-auto">
          <div className="p-8 bg-white rounded-md shadow w-full text-center">
            <h3 className="text-xl font-semibold">Connect a wallet to continue</h3>
          </div>
        </div>
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
