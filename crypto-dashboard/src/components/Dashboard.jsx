import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";

const Dashboard = () => {
  // Giá thị trường
  const [btcPrice, setBtcPrice] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);

  // Lịch sử Equity (mỗi giờ)
  const [equityHistory, setEquityHistory] = useState([]);

  const equityChartRef = useRef(null);

  // Cài đặt cố định
  const entryBTC = 81319.58;
  const entryETH = 1349;
  const sizeBTC = 12000;
  const sizeETH = 9000;
  const collateralBTC = 6000;
  const collateralETH = 3000;
  const leverageBTC = 10;
  const leverageETH = 5;
  const initialBalance = 300000;

  // Tính giá thanh lý (đơn giản)
  const liqPriceBTC = entryBTC * (1 - 1 / leverageBTC);
  const liqPriceETH = entryETH * (1 - 1 / leverageETH);

  // Fetch giá
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const [btcRes, ethRes] = await Promise.all([
          fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"),
          fetch("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT"),
        ]);
        const btc = await btcRes.json();
        const eth = await ethRes.json();
        const btcNum = Number(btc.price);
        const ethNum = Number(eth.price);
        setBtcPrice(btcNum);
        setEthPrice(ethNum);

        // Tính PnL và Equity
        const pnlBTC = (btcNum - entryBTC) * sizeBTC / entryBTC;
        const pnlETH = (ethNum - entryETH) * sizeETH / entryETH;
        const equity = initialBalance + pnlBTC + pnlETH;

        const label = new Date().toLocaleTimeString();
        setEquityHistory(prev => [...prev.slice(-12), { time: label, equity }]);
      } catch (err) {
        console.error("Fetch failed", err);
      }
    };

    fetchPrices();
   const interval = setInterval(fetchPrices, 3000); // mỗi 3 giây

    return () => clearInterval(interval);
  }, []);

  // Render biểu đồ Equity
  useEffect(() => {
    if (!document.getElementById("equityChart")) return;

    if (equityChartRef.current) equityChartRef.current.destroy();

    const ctx = document.getElementById("equityChart").getContext("2d");
    equityChartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: equityHistory.map(d => d.time),
        datasets: [
          {
            label: "Equity",
            data: equityHistory.map(d => d.equity),
            borderColor: "#00ffff",
            backgroundColor: "rgba(0,255,255,0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        plugins: { legend: { labels: { color: "white" } } },
        scales: {
          x: { ticks: { color: "gray" } },
          y: { ticks: { color: "gray" } },
        },
      },
    });
  }, [equityHistory]);

  const fmt = val => val?.toLocaleString("en-US", { minimumFractionDigits: 2 });

  const renderPosition = (label, entry, mark, size, collateral, leverage, liq) => {
    const pnl = mark ? (mark - entry) * size / entry : 0;
    const pnlPercent = mark ? ((mark - entry) / entry * 100).toFixed(2) : "0.00";
    return (
      <div style={{
        background: "#1c1c2a",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        borderRadius: "10px",
        width: "100%",
        maxWidth: "500px",
        boxShadow: "0 0 10px rgba(255,255,255,0.05)",
        color: "#eee"
      }}>
        <h3 style={{ marginBottom: "0.5rem" }}>{label} <span style={{ color: "lime" }}>Long x{leverage}</span></h3>
        <p>Entry: <strong>${fmt(entry)}</strong></p>
        <p>Price: <strong>${fmt(mark)}</strong></p>
        <p>Size: <strong>${fmt(size)}</strong></p>
        <p style={{ color: pnl >= 0 ? "lime" : "red" }}>
          PnL: <strong>${fmt(pnl)} ({pnlPercent}%)</strong>
        </p>
        <p>Collateral: <strong>${fmt(collateral)}</strong></p>
        <p>Liq. Price: <strong style={{ color: "orange" }}>${fmt(liq)}</strong></p>
      </div>
    );
  };

  return (
    <div style={{
      background: "#0d0d0d",
      color: "white",
      minHeight: "100vh",
      padding: "2rem",
      display: "flex",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{ maxWidth: "1200px", width: "100%", textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "2rem" }}>📊 Crypto Dashboard</h2>

        <section style={{ marginBottom: "2rem" }}>
          <h3 style={{ color: "#00ffff", marginBottom: "1rem" }}>Positions</h3>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {renderPosition("BTC/USD", entryBTC, btcPrice, sizeBTC, collateralBTC, leverageBTC, liqPriceBTC)}
            {renderPosition("ETH/USD", entryETH, ethPrice, sizeETH, collateralETH, leverageETH, liqPriceETH)}
          </div>
        </section>

        <section>
          <h3 style={{ color: "#00ffff", marginBottom: "1rem" }}>Total Equity (Every Hour)</h3>
          <div style={{
            background: "#1c1c2b",
            padding: "1rem",
            borderRadius: "10px",
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto"
          }}>
            <canvas id="equityChart" height="200"></canvas>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
