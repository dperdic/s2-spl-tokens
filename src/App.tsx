import { WalletContextProvider } from "./components/WalletContextProvider";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";
import "./App.css";

export default function App() {
  return (
    <WalletContextProvider>
      <Header />
      <Main />
      <Footer />
    </WalletContextProvider>
  );
}
