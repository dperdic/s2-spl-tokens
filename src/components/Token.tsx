import { useAppStore } from "../state/store";
import CreateMint from "./CreateMint";
import MintTokens from "./MintTokens";
import BurnTokens from "./BurnTokens";
import TransferTokens from "./TransferTokens";
import DelegateTokens from "./DelegateTokens";
import RevokeDelegate from "./RevokeDelegate";
import CloseTokenAccount from "./CloseTokenAccount";

export default function Token() {
  const mint = useAppStore(state => state.mint);
  const tokenDecimals = useAppStore(state => state.tokenDecimals);
  const tokenBalance = useAppStore(state => state.tokenBalance);
  const delegate = useAppStore(state => state.delegate);
  const delegatedAmount = useAppStore(state => state.delegatedAmount);

  const formatDelegatedTokenAmount = (delegatedAmount: bigint) => {
    return (Number(delegatedAmount) / Math.pow(10, tokenDecimals)).toString();
  };

  return (
    <div className="flex flex-col gap-4 max-w-192">
      <h3 className="text-2xl">SPL Token</h3>

      <div className="flex flex-col gap-6">
        {mint ? (
          <>
            <div>
              <div className="break-words">Mint address: {mint?.toBase58()}</div>
              <div className="break-words">Token balance: {tokenBalance}</div>
              <div className="break-words">Delegate account: {delegate?.toBase58()}</div>
              <div className="break-words">Delegated tokens: {formatDelegatedTokenAmount(delegatedAmount)}</div>
            </div>
            <MintTokens />
            <BurnTokens />
            <TransferTokens />
            <DelegateTokens />
            <CloseTokenAccount />
            {delegate && <RevokeDelegate />}
          </>
        ) : (
          <CreateMint />
        )}
      </div>
    </div>
  );
}
