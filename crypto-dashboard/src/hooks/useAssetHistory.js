import { useEffect, useState } from "react";

const useAssetHistory = (btcEntry, btcSize, ethEntry, ethSize, spotValue) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const [btcRes, ethRes] = await Promise.all([
          fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"),
          fetch("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT")
        ]);
        const btcPrice = parseFloat((await btcRes.json()).price);
        const ethPrice = parseFloat((await ethRes.json()).price);

        const btcPnl = ((btcPrice - btcEntry) * btcSize) / btcEntry;
        const ethPnl = ((ethPrice - ethEntry) * ethSize) / ethEntry;
        const total = spotValue + 2008836.12 + 1000000 + btcPnl + ethPnl;

        const time = new Date().toLocaleTimeString();
        setHistory(prev => [...prev.slice(-9), { time, total }]);
      } catch (e) {
        console.error("Error fetching asset data:", e);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 3000);

    return () => clearInterval(interval);
  }, [btcEntry, btcSize, ethEntry, ethSize, spotValue]);

  return history;
};

export default useAssetHistory;
