import { useWalletStateStore } from "../state/store";

export default function Solana() {
  const walletState = useWalletStateStore(state => state.walletState);

  return <div>Balance: {walletState.solBalance} SOL</div>;
}
