import { WalletContextProvider } from "./components/WalletContextProvider";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css";

export default function App() {
  return (
    <WalletContextProvider>
      <Header />

      <main className="w-full flex-grow sm:px-16 px-8 py-8"></main>

      <Footer />
    </WalletContextProvider>
  );
}
