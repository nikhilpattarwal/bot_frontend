import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { OnlineStatusProvider } from './contextApi/onlineStatusContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <OnlineStatusProvider>
      <App />
    </OnlineStatusProvider>
  </React.StrictMode>
);


