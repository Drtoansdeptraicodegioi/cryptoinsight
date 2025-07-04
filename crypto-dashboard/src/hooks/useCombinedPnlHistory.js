import { useEffect, useState } from "react";

const useCombinedPnlHistory = (btcEntry, btcSize, ethEntry, ethSize) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const [btcRes, ethRes] = await Promise.all([
          fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"),
          fetch("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT"),
        ]);
        const btcPrice = parseFloat((await btcRes.json()).price);
        const ethPrice = parseFloat((await ethRes.json()).price);

        const btcPnl = ((btcPrice - btcEntry) * btcSize) / btcEntry;
        const ethPnl = ((ethPrice - ethEntry) * ethSize) / ethEntry;

        const time = new Date().toLocaleTimeString();

        setData((prev) => [
          ...prev.slice(-9),
          { time, btcPnl, ethPnl },
        ]);
      } catch (e) {
        console.error("Pnl history fetch error:", e);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 3000);

    return () => clearInterval(interval);
  }, [btcEntry, btcSize, ethEntry, ethSize]);

  return data;
};

export default useCombinedPnlHistory;
