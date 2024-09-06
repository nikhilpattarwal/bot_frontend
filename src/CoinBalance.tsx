import React from 'react';

interface CoinBalanceProps {
  balance: number;
  remaining: number;
}

const CoinBalance: React.FC<CoinBalanceProps> = ({ balance,remaining }) => {
  const maxCoins = 500;

  return (
    <div className="coin-balance-container">
      <div className="coin-balance">
        <span className="coin-icon">💰</span> Coins: {balance}
      </div>
      <div className='cont-box'>
        <div className="max-coins">
          Remaining {remaining}
        </div>
        <div className="max-coins">Daily Limit: {maxCoins} </div>
      </div>
    </div>
  );
};

export default CoinBalance;
