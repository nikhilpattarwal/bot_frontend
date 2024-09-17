import React, { useState, useEffect } from 'react';
import TapButton from './TapButton';
import CoinBalance from './CoinBalance';
import ProgressBar from './ProgressBar';
import './App.css';
import { useOnlineStatus } from './contextApi/onlineStatusContext';

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
  const [userId, setUserId] = useState<number>(1807486712);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [loading,setLoading] =useState<boolean>(true); 
  const storedDailyRemaining = Number(localStorage.getItem('dailyRemaining'));
  const storedDate = localStorage.getItem('lastResetDate');
  const [sync,setSync] = useState<boolean>(false);
  const isOnline = useOnlineStatus();

  console.log('isOnlineisOnline',isOnline);

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
    if (userId !==0) { 
      fetchCoinBalance(userId.toString()).then((balance) => {

        if (balance !== undefined) {
          setBalance(balance);
          setLoading(false);
          localStorage.setItem('balance', balance.toString());
        }
      });
    }
  }, [userId]);


 

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
    if (!isOnline && dailyRemaining >0) {
      const offlineCoins = Number(localStorage.getItem('offlineCoins')) || 0;
      const updatedOfflineCoins = offlineCoins + 1;
      localStorage.setItem('offlineCoins', updatedOfflineCoins.toString());
      console.log('Offline coins stored:', updatedOfflineCoins);
    }
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
  }};



    // Update user's coin balance on the server
const updateCoins = async (id: number, coinsToAdd: number) => {
  if (coinsToAdd <= 0) return; // Avoid updating coins if 0 or less
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
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
        variables: { id: id.toString(), coins: coinsToAdd },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update coins: ${response.status}`);
    }

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
    return fetchData.data.getUserCoins
  } catch (error) {
    console.error('Error updating coins:', error);
  }
};

// sync offline coins
const syncOfflineCoins = async () => {
  const offlineCoins = Number(localStorage.getItem('offlineCoins')) || 0;
  if (offlineCoins > 0) {
    try {
      const prevBalance = (await fetchCoinBalanceRetry(userId.toString())) ?? 0 ;  
      console.log('Previous Balance:', prevBalance, 'Offline Coins:', offlineCoins);
      const newBalance = offlineCoins + prevBalance;
      console.log('New Balance:', newBalance);
      await updateCoins(userId, newBalance);
      localStorage.removeItem('offlineCoins');
      console.log('Offline coins synced and removed from localStorage');
    } catch (error) {
      console.error('Error syncing offline coins:', error);
    }
  }
};

// Function to sync local and server balance
const syncBalance = async (localBalance: number) => {
  let serverBalance;
  try {
    if (userId !== 0) {
       serverBalance = await fetchCoinBalance(userId.toString());
    }
    if (serverBalance !== undefined) {
      const totalBalance = Math.max(localBalance, serverBalance);
      setBalance(totalBalance);

      if (localBalance > serverBalance) {
        await updateCoins(userId, totalBalance);
      }
    }
  } catch (error) {
    console.error('Error syncing balance:', error);
  }
};


const fetchCoinBalanceRetry = async (userId: string, retries = 3): Promise<number | undefined> => {
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

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched coin balance:', data);
    return data.data.getUserCoins;
  } catch (error) {
    console.error('Error fetching coin balance:', error);
    if (retries > 0) {
      console.log(`Retrying... ${retries} retries left`);
      return fetchCoinBalanceRetry(userId, retries - 1);  // Retry if failed
    }
  }
};


useEffect(() => {
  const handleSync = async () => {
    if (isOnline) {
      setSync(true)
      try {
        const offlineCoins = Number(localStorage.getItem('offlineCoins')) || 0;

        if (offlineCoins > 0) {
          await syncOfflineCoins();
          await syncBalance(balance); 
        } else {
          await syncBalance(balance); 
        }
      } catch (error) {
        console.error('Error syncing coins:', error);
      }
      setSync(false)
    }
  };

  handleSync();
}, [isOnline]);


  return (
    <div className="App">
    {loading? (
      <div className="loader">Loading...</div>
    ) : (
      <>
        <CoinBalance balance={balance} remaining={dailyRemaining} sync={sync} />
        <TapButton onClick={handleTap} />
        <ProgressBar value={DAILY_LIMIT - dailyRemaining} max={DAILY_LIMIT} />
      </>
     )}
  </div>
  );
};

export default App;
