import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Header() {
  return (
    <header className="flex h-18 w-full bg-white shadow-sm">
      <nav className="flex h-full w-full sm:px-16 px-8 gap-4 items-center justify-between">
        <img src="/vite.svg" alt="vite" className="h-10" />

        <WalletMultiButton />
      </nav>
    </header>
  );
}
