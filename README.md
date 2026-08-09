# 🎁 Reward & Wallet Microservices Ecosystem

A decoupled microservices architecture for managing customer rewards, referrals, order milestones, and wallet point balances in a SuperApp ecosystem.

---

## 🚀 Microservices & Applications

| Service / App | Port | Description |
| :--- | :--- | :--- |
| **Auth Service** | `5000` | User authentication, registration, identity & JWT token generation. |
| **Reward Service** | `5001` | Rule evaluation engine (product combos, referrals, order milestones) & reward revocation. |
| **Wallet Service** | `5002` | Balance ledger, FIFO point redemptions, reward expirations & transaction histories. |
| **Admin Panel** | `3000` | Next.js 14 dashboard for managing reward rules and inspecting customer wallets. |
| **OyeBunny Food App** | `3001` | Consumer food delivery web app demonstrating cart checkout, points redemption & rewards. |

---

## 💡 Key Business Rules

- **Product Combo Reward**: Purchasing **3 distinct products** in a single order grants **+20 Reward Points**.
- **Referral Reward**: Referring a user who completes their first order grants **+100 Points** to the referrer.
- **Milestone Reward**: Completing **10 successful orders** grants **1 Free Delivery Token**.
- **Points Conversion**: **2 Points = Rs. 1** discount at checkout (e.g. 100 Points = Rs. 50).
- **Points Expiry**: Earned reward points expire automatically after **45 days**.
- **Order Revocation**: Cancelling a completed order automatically revokes granted rewards.

---

## 🛠️ Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** running on `mongodb://localhost:27017`

### 2. Setup & Install Dependencies

Run in terminal to copy env files and install dependencies for all services:

```bash
cd auth-service && cp .env.example .env && npm install && cd ..
cd reward-service && cp .env.example .env && npm install && cd ..
cd wallet-service && cp .env.example .env && npm install && cd ..
cd admin-panel && cp .env.example .env.local && npm install && cd ..
cd oyebunny-app && cp .env.example .env.local && npm install && cd ..
```

### 3. Run Services

Start each service in its own terminal tab:

```bash
# Terminal 1
cd auth-service && npm run dev

# Terminal 2
cd wallet-service && npm run dev

# Terminal 3
cd reward-service && npm run dev

# Terminal 4
cd admin-panel && npm run dev

# Terminal 5
cd oyebunny-app && npm run dev
```

---

## 🌐 Application Access

- **OyeBunny Consumer App**: [http://localhost:3001](http://localhost:3001)
- **Admin Panel**: [http://localhost:3000](http://localhost:3000) *(Admin Login: `admin@rewards.com` / `Admin@12345`)*
