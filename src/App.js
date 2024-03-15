import { Navigate, Route, Routes } from "react-router-dom";
import 'tailwindcss/tailwind.css';
import { WalletProvider } from './WalletContext.js';
import BitmapBridge from "./pages/BitmapBridge";
import SwapBridge from "./pages/BitmapBridge/SwapBride/SwapBride";
import Bridge from "./pages/Bridge";
import InscriptionBridge from "./pages/InscriptionBridge/InscriptionBridge.jsx";
import LendBridge from "./pages/InscriptionBridge/LendBridge.jsx";
import LABBBridge from "./pages/LABBBridge/LABBBridge.jsx";
import LiquidityPool from "./pages/LiquidityPool/index.js";
import NetworkOverview from "./pages/NetworkOverview";
import ORDIBridge from "./pages/ORDIBridge/ORDIBridge.jsx";
import PipeBridge from "./pages/PipeBridge/PipeBridge";
import SwapAndSend from "./pages/SwapAndSend";


function App() {
  return (
    <WalletProvider>
      <div className="App">
        <Routes>
          <Route path="/bridge" element={<Bridge />} />
          <Route path="/swap-and-send" element={<SwapAndSend />} />
          <Route path="/liquidity-pool" element={<LiquidityPool />} />
          <Route path="/bitmap-bridge" element={<BitmapBridge />} />
          <Route path="/bitmap-bridge/bridiging" element={<SwapBridge />} />
          <Route path="/network-overview" element={<NetworkOverview />} />
          <Route path="/pipe-bridge" element={<PipeBridge />} />
          <Route path="/labb-bridge" element={<LABBBridge />} />
          <Route path="/ordi-bridge" element={<ORDIBridge />} />
          <Route path="/insc-bridge" element={<InscriptionBridge />} />
          <Route path="/lend-bridge" element={<LendBridge />} />
          <Route path="*" element={<Navigate to="/bridge" />} />
        </Routes>
      </div>
    </WalletProvider>
  );
}

export default App;