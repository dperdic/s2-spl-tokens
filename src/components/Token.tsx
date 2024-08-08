import { useAppStore } from "../state/store";
import CreateMint from "./CreateMint";
import MintTokens from "./MintTokens";
import BurnTokens from "./BurnTokens";
import TransferTokens from "./TransferTokens";
import DelegateTokens from "./DelegateTokens";

export default function Token() {
  const mint = useAppStore(state => state.mint);

  return (
    <div className="flex flex-col gap-4 max-w-192">
      <h3 className="text-2xl">Token</h3>

      <div className="flex flex-col gap-6">
        <CreateMint />

        {mint && (
          <>
            <MintTokens />
            <BurnTokens />
            <TransferTokens />
            <DelegateTokens />
          </>
        )}
      </div>
    </div>
  );
}
