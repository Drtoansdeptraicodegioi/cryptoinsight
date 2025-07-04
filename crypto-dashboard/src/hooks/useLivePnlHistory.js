import { useEffect, useState } from "react";

const useLivePnlHistory = (entryPrice, size) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
        const { price } = await res.json();
        const mark = parseFloat(price);
        const pnl = ((mark - entryPrice) * size) / entryPrice;

        const time = new Date().toLocaleTimeString();

        setData(prev => [...prev.slice(-9), { time, pnl }]); // giữ 10 điểm gần nhất
      } catch (err) {
        console.error("PnL API error:", err);
      }
    };

    fetchPrice(); // gọi lần đầu
    const interval = setInterval(fetchPrice, 30000); // mỗi 30s

    return () => clearInterval(interval);
  }, [entryPrice, size]);

  return data;
};

export default useLivePnlHistory;
