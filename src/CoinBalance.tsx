import React, { useEffect, useState } from 'react';
import './coinbalance.css';
import { CiWifiOff } from "react-icons/ci";
import { CiWifiOn } from "react-icons/ci";
import { useOnlineStatus } from './contextApi/onlineStatusContext';

interface CoinBalanceProps {
  balance: number;
  remaining: number;
  sync:boolean;
}

const CoinBalance: React.FC<CoinBalanceProps> = ({ balance,remaining,sync}) => {
  const maxCoins = 500;
  const isOnline = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [showOnline, setShowOnline] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowOnline(true); 
      const timer = setTimeout(() => {
        setShowOnline(false); 
      }, 3000);
      return () => clearTimeout(timer);
    }
    if (!isOnline) {
      setWasOffline(true); 
    } else {
      setWasOffline(false); 
    }
  }, [isOnline, wasOffline]);

  return (
  <>
    {!isOnline && (
      <div className="offline-banner">
        <div className="offline-banner-content">
        <CiWifiOff style={{fontSize:'1.5rem'}}/>
          <span >You're offline!</span>
        </div>
      </div>
    )}
    {showOnline && (
      <div className="online-banner">
        <div className="offline-banner-content">
        <CiWifiOn style={{fontSize:'1.5rem'}}/>
          <span >Back Online</span>
        </div>
      </div>
    )}
     {sync && (
      <div className="online-banner">
        <div className="offline-banner-content">
        <CiWifiOn style={{fontSize:'1.5rem'}}/>
          <span >Syncing</span>
        </div>
      </div>
    )}


    <div className="coin-balance-container">
      <div className="coin-balance">
        <span className="coin-icon">💰</span> Coins: {balance}
      </div>
      <div className='cont-box'>
        <div className="max-coins">
          Remaining: {remaining}
        </div>
        <div className="max-coins">Daily Limit: {maxCoins} </div>
      </div>
    </div>
  </>
 
  );
};

export default CoinBalance;
