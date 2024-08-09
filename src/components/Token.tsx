import { useAppStore } from "../state/store";
import CreateMint from "./CreateMint";
import MintTokens from "./MintTokens";
import BurnTokens from "./BurnTokens";
import TransferTokens from "./TransferTokens";
import DelegateTokens from "./DelegateTokens";
import TokenAccount from "./TokenAccount";

export default function Token() {
  const mint = useAppStore(state => state.mint);
  const ata = useAppStore(state => state.ata);
  const tokenDecimals = useAppStore(state => state.tokenDecimals);
  const tokenBalance = useAppStore(state => state.tokenBalance);
  const delegate = useAppStore(state => state.delegate);
  const delegatedAmount = useAppStore(state => state.delegatedAmount);

  const formatDelegatedTokenAmount = (delegatedAmount: bigint) => {
    const res = Number(delegatedAmount) / Math.pow(10, tokenDecimals);

    if (isNaN(res)) {
      return 0;
    }

    return res;
  };

  return (
    <div className="max-w-3xl w-full mx-auto">
      <h3 className="text-xl font-semibold pb-4">SPL Token</h3>

      <div className="grid gap-8 p-4 bg-white rounded-md shadow w-full">
        {mint ? (
          <>
            <div className="break-all">
              <div>Mint address: {mint.toBase58()}</div>
              <div>Token account: {ata?.toBase58()}</div>
              <div>Token balance: {tokenBalance}</div>
              <div>Delegate account: {delegate?.toBase58()}</div>
              <div>Delegated tokens: {formatDelegatedTokenAmount(delegatedAmount)}</div>
            </div>
            <TokenAccount />
            <MintTokens />
            <BurnTokens />
            <TransferTokens />
            <DelegateTokens />
          </>
        ) : (
          <CreateMint />
        )}
      </div>
    </div>
  );
}
