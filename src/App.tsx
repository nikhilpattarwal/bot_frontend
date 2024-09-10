import React, { useState, useEffect } from 'react';
import TapButton from './TapButton';
import CoinBalance from './CoinBalance';
import ProgressBar from './ProgressBar';
import './App.css';

const GRAPHQL_ENDPOINT = 'https://bot-backend-c5u1.onrender.com/graphql'; 

const DAILY_LIMIT = 500;
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        init(): void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}

const App: React.FC = () => {
  const [balance, setBalance] = useState<number>(0); 
  const [dailyRemaining, setDailyRemaining] = useState<number>(DAILY_LIMIT); 
  const [userId, setUserId] = useState<number>(0);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [loading,setLoading] =useState<boolean>(true); 
  const storedDailyRemaining = Number(localStorage.getItem('dailyRemaining'));
  const storedDate = localStorage.getItem('lastResetDate');
  useEffect(() => {
    
    const today = new Date().toDateString();
  
    if (!storedDate || storedDate !== today) {
      localStorage.setItem('lastResetDate', today);
      setDailyRemaining(DAILY_LIMIT);
      localStorage.setItem('dailyRemaining', DAILY_LIMIT.toString());
    } else {
      setDailyRemaining(storedDailyRemaining);
    }
  }, []);


 //fetch balance
  const fetchCoinBalance = async (userId: string) => {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetUserCoins($id: String!) {
              getUserCoins(id: $id)
            }
          `,
          variables: { id: userId },
        }),
      });
  
      const data = await response.json();
      console.log('Fetched coin balance:', data);
      return data.data.getUserCoins;
    } catch (error) {
      console.error('Error fetching coin balance:', error);
    }
  };
  
  useEffect(() => {
    if (userId) { 
      fetchCoinBalance(userId.toString()).then((balance) => {
        if (balance !== undefined) {
          setBalance(balance);
          setLoading(false);
          localStorage.setItem('balance', balance.toString());
        }
      });
    }
  }, [userId]);


  const socket = new WebSocket('wss://telegram-bot-3rp6.onrender.com');
  // const socket = new WebSocket('ws://localhost:8080');

  //web socket
  const connectWebSocket = () => {

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        console.log('Received user ID:', message.id);
        setUserId(message.id);
        localStorage.setItem('userId', message.id.toString()); 
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed, attempting to reconnect...');
      
      setTimeout(() => connectWebSocket(), 5000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(socket);
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    
    if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
    
  
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
  
      if (user && user.id) {
        setUserId(user.id);
        localStorage.setItem('userId', user.id.toString());
        console.log('User ID fetched from Telegram:', user.id);
      }
    } else {
      console.warn('This app is not running inside Telegram WebApp. Fallback to mock data.');
     
    }
  }, []);

  const updateLocalStorage = (newBalance: number, newDailyRemaining: number) => {
    localStorage.setItem('balance', newBalance.toString());
    localStorage.setItem('dailyRemaining', newDailyRemaining.toString());
  };
  
  // tap function for adding coins
  const handleTap = async () => {
    if(dailyRemaining >0){
    const newBalance = balance + 1;
    const newDailyRemaining = dailyRemaining - 1;


    setBalance(newBalance);
    setDailyRemaining(newDailyRemaining);
    updateLocalStorage(newBalance, newDailyRemaining);

    try {
      
      const updateResponse = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation UpdateUserCoins($id: String!, $coins: Int!) {
              updateUserCoins(id: $id, coins: $coins) {
                id
                coin_balance
              }
            }
          `,
          variables: {
            id: userId.toString(), 
            coins: newBalance
          }
        }),
      });
  
      const updateData = await updateResponse.json();
      console.log('Update Response:', updateData);

      
      const fetchResponse = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetUserCoins($id: String!) {
              getUserCoins(id: $id)
            }
          `,
          variables: {
            id: userId.toString(), 
          }
        }),
      });
  
      const fetchData = await fetchResponse.json();
      console.log('Fetched Balance Data:', fetchData);
  
      if (fetchData.data && fetchData.data.getUserCoins !== null) {
        const serverBalance = fetchData.data.getUserCoins;
        if (serverBalance !== newBalance) {
        
          updateLocalStorage(serverBalance, newDailyRemaining);
        }
      }
    } catch (error) {
      console.error('Error updating or fetching coins:', error);
    }
  }
  };

  return (
    <div className="App">
    {loading? (
      <div className="loader">Loading...</div>
    ) : (
      <>
        <CoinBalance balance={balance} remaining={dailyRemaining} />
        <TapButton onClick={handleTap} />
        <ProgressBar value={DAILY_LIMIT - dailyRemaining} max={DAILY_LIMIT} />
      </>
     )}
  </div>
  );
};

export default App;
