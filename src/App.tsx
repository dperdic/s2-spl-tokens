import { WalletContextProvider } from "./components/WalletContextProvider";
import Header from "./components/Header";
import "./App.css";
import Footer from "./components/Footer";

export default function App() {
  return (
    <WalletContextProvider>
      <Header />

      <main className="w-full flex-grow sm:px-16 px-8 py-8"></main>

      <Footer />
    </WalletContextProvider>
  );
}
