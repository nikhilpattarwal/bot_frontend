# Telegram WebApp Clicker Game

This project is a clicker game integrated with a Telegram WebApp. Users can earn coins by tapping a button, with a daily coin limit enforced. The application uses WebSockets to fetch user data, GraphQL for handling backend queries and mutations, and Supabase for database management.

## Features

- **Coin Management**: Users can tap the button to earn coins. Coin balance is updated and stored in Supabase.
- **Daily Limit**: Users can earn up to 500 coins per day. Remaining taps and daily limit information are displayed.
- **Real-time Data**: The app fetches real-time data using WebSockets for user interaction and coin updates.
- **Telegram WebApp Integration**: The app is designed to work inside Telegram WebApp with user authentication.

## Tech Stack

- **React.js** for frontend development.
- **GraphQL** with Yoga for backend API queries and mutations.
- **Supabase** for database management.
- **WebSockets** for real-time user interaction and data updates.
- **Express.js** for handling backend routing and CORS.
- **Telegram Bot API** for integrating the clicker game inside Telegram.

## Installation

1. Clone the repository:


git clone (https://github.com/nikhilpattarwal/bot_frontend/)
cd bot_frontend

## Install the required dependencies:
npm install

## Set up the environment variables in a .env file:
SUPABASE_URL=<Your Supabase URL>
SUPABASE_KEY=<Your Supabase Key>
PORT=<Backend Port>

Frontend Components
App.tsx
The main component that handles the game logic, fetching coin balances, and updating the state. It interacts with the WebSocket server and updates the user's coin balance via GraphQL.

TapButton.tsx
A button component that allows the user to tap and earn coins.

CoinBalance.tsx
Displays the user's current coin balance and the remaining number of coins they can earn for the day.

ProgressBar.tsx
A progress bar component showing the user's progress towards the daily coin limit.

WebSocket Integration
WebSocket is used to receive real-time updates of user IDs when they interact with the game. The WebSocket server runs at wss://telegram-bot-3rp6.onrender.com.

Deploying the Backend
The backend can be hosted on platforms like Render or Vercel. Ensure that the WebSocket server and the GraphQL API are running and accessible from the frontend.

