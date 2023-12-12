import { Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider } from './WalletContext.js';
import SwapBridge from "./pages/BitmapBridge/SwapBride/SwapBride";
import Bridge from "./pages/Bridge";
import SwapAndSend from "./pages/SwapAndSend";
import NetworkOverview from "./pages/NetworkOverview";
import BitmapBridge from "./pages/BitmapBridge";
import PipeBridge from "./pages/PipeBridge/PipeBridge";
import LABBBridge from "./pages/LABBBridge/LABBBridge.jsx";


function App() {
  return (
    <WalletProvider>
      <div className="App">
        <Routes>
          <Route path="/bridge" element={<Bridge />} />
          <Route path="/swap-and-send" element={<SwapAndSend />} />
          <Route path="/bitmap-bridge" element={<BitmapBridge />} />
          <Route path="/bitmap-bridge/bridiging" element={<SwapBridge />} />
          <Route path="/network-overview" element={<NetworkOverview />} />
          <Route path="/pipe-bridge" element={<PipeBridge />} />
          <Route path="/labb-bridge" element={<LABBBridge />} />
          <Route path="*" element={<Navigate to="/bridge" />} />
        </Routes>
      </div>
    </WalletProvider>
  );
}

export default App;