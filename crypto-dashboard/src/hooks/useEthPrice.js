import { useState, useEffect } from 'react';

const useEthPrice = () => {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
        const data = await res.json();
        setPrice(parseFloat(data.price));
      } catch (e) {
        console.error("Lỗi ETH:", e);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 10000);
    return () => clearInterval(interval);
  }, []);

  return price;
};

export default useEthPrice;
