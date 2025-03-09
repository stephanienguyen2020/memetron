# MEMETRON - BEST MEME COIN PLAYGOUND ON ELECTRONEUM  

MemeTron solves key challenges in the meme coin space by automating creation, trading, speculation, and marketing through AI-powered tools and fair launch mechanics. It eliminates the need for coding by allowing users to describe their meme idea, with AI handling everything from naming to deployment. Unlike traditional meme coins prone to rug pulls, MemeTron enforces liquidity locking, fair launch mechanisms, and a 10-day vesting period to protect investors. Its multi-agent AI system provides real-time market insights, tracks social sentiment, monitors whale movements, and identifies new token opportunities. The platform also features an on-chain betting marketplace for predicting meme coin trends and an Auto Shill Agent that automates token promotion across social media. Additionally, users can launch tokens simply by chatting with a bot or tagging it on Twitter, making the entire process seamless and accessible.

## 🚀 Contract Address

Electroneum Mainnet
- **Block Explorer:** blockexplorer.electroneum.com
- **RPC URL**: https://rpc.ankr.com/electroneum
- **CHAINID**: 52014

Contracts: 
- **Factory**: 0xD4B453A5F41092f69C736ad64c9a7d8E6989dc53
- **Launchpad Agent**: 0x43f02972D8D238A6748A6a2270D860cf703838b7
- **Native Liquidity Pool**: 0x897eC4aF77346F8Ae3E707527220BDcC4782230E
- **Bookie Bet**: 0x6E0CC7eAb0672dEbFe84f49401325B3ad16125A0

## 🚀 Features

### **Seamless Wallet Integration**

Connect wallets easily with secure authentication—no private key management required.

### **Dashboard & Portfolio Tracking**

Monitor holdings in real-time, track profits/losses, and get AI-driven price predictions.

### **🛠 Betting Marketplace**

- Bet on meme coin trends directly via Twitter by tagging **@MemeTron**. Smart contracts ensure secure escrow and instant payouts.
- Creating bet easily by tagging our agent on Twitter 

### **🚀 Meme Coin Launch Pad**

Launch your own token with an AI-powered branding assistant, instant deployment, and on-chain security.

- Utilizes a custom bonding curve that dynamically adjusts token prices based on market supply and demand.
- Once a meme token reaches its funding goal, liquidity creation is triggered through the Native Liquidity Pool. Early contributors receive rewards, allowing them to mint additional tokens on Electroneum.
- A Marketplace where users can create, buy, and trade all launched meme tokens.

### **📊 Multi-Agent Framework**
- Our News Agent monitors live news, social media, and major outlets to deliver instant alerts on market-moving events, ensuring you’re always informed.
- Our Twitter Agent parses tweets and launches tokens, shill coins, and creates prediction markets automatically. 
- Our Token Analysis Agent analyzes real-time market trends, Google search volumes, and CoinMarketCap data to detect emerging opportunities before they gain traction.
- The Social Sentiment Agent tracks social engagement across Twitter, Reddit, and Telegram, providing AI-driven sentiment analysis to gauge community hype and investor mood.
- Our Search Agent scans platforms like Pump.fun and other launchpads to detect newly minted tokens with high breakout potential, giving you early access to trending projects.
- Our Swap Agent identifies the best liquidity pools and price points across multiple blockchains to ensure trades at optimal rates. 
- Our Whale Watch Agent tracks whale and influencer wallet activity, providing deep insights into holder percentages, big-money movements, and market impact—helping you spot trends before they make headlines.


---

# **How to Run MemeTron**

## **1. Clone the Repository**

```bash
git clone https://github.com/stephanienguyen2020/memetron
cd memetron
```

## **2. Set Up Environment Variables**

Create a `.env` file inside both the `frontend/` and `backend/` directories.

```bash
# Copy the sample environment files
cp frontend/.env.sample frontend/.env
cp backend/.env.sample backend/.env

# Edit the .env files and fill in your credentials
```

## **3. Running the Frontend**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
# or
bun install

# Start the development server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

This will start the frontend on [http://localhost:3000](http://localhost:3000).

## **4. Running the Backend**

In a separate terminal:

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload
```

This will start the backend on [http://localhost:8000](http://localhost:8000).

## **5. Running the Eliza Agent**

In a new terminal window:

```bash
# Clone the repository (if not already done)
git clone https://github.com/stephanienguyen2020/memetron
cd memetron

# Switch to the Eliza branch
git checkout eliza

# Create and configure environment
cp .env.sample .env
# Edit .env file with your credentials

# Install dependencies and build
pnpm install
pnpm build

# Start the Eliza agent
pnpm start --character="characters/crypto-sage.json"
```

## Troubleshooting

If you encounter any issues:

1. Make sure all environment variables are properly set
2. Check that all required ports (3000, 8000) are available
3. Ensure you have the correct versions of Node.js and Python installed
4. Clear your browser cache if you experience UI issues

## Development Notes

- The frontend runs on Next.js 14 with App Router
- Backend uses FastAPI with Python 3.8+
- Eliza agent requires Node.js 18+ and pnpm
- Make sure to run all three components (frontend, backend, and Eliza agent) for full functionality
