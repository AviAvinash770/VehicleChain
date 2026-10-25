# VehicleChain Setup & Execution Guide

## 1. Prerequisites

- **Node.js**: v18.0.0 or later (v20+ recommended, tested on Node v22)
- **npm**: v9.0.0 or later
- **MetaMask**: Browser extension for Web3 wallet interactions
- **MongoDB**: Optional (If MongoDB is not installed locally, the backend automatically boots an embedded in-memory MongoDB instance with zero configuration required!)

---

## 2. Quick Installation (One-Command Setup)

From the project root directory:

```bash
# 1. Install root dependencies
npm install

# 2. Install all sub-project dependencies (Blockchain, Backend, Frontend)
npm run install:all
```

---

## 3. Running Local Blockchain (Hardhat)

Open a terminal in `./blockchain`:

```bash
cd blockchain

# Start local EVM node with 20 pre-funded test accounts
npx hardhat node
```

In a separate terminal, deploy the smart contract:

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```
*Note: The deployment script automatically generates `blockchain/deployments/VehicleRegistry.json` which the backend reads directly.*

---

## 4. Running Backend Server

In a terminal in `./backend`:

```bash
cd backend
npm run dev
```

- Server will start on `http://localhost:5000`
- Automatically seeds demo accounts and specimen vehicle `AP 39 AB 2026`!
- Health Check: `http://localhost:5000/api/health`

### Pre-Configured Demo Accounts:
| Role | Email | Password | Pre-Funded Hardhat Wallet |
| :--- | :--- | :--- | :--- |
| **RTO Authority** | `authority@vehiclechain.gov.in` | `Password@123` | Hardhat Account #0 (`0xf39f...2266`) |
| **Current Owner** | `owner@vehiclechain.gov.in` | `Password@123` | Hardhat Account #1 (`0x7099...79c8`) |
| **Prospective Buyer**| `buyer@vehiclechain.gov.in` | `Password@123` | Hardhat Account #2 (`0x3c44...93bc`) |
| **Public Verifier** | `verifier@vehiclechain.gov.in` | `Password@123` | Hardhat Account #3 (`0x90f7...b906`) |

---

## 5. Running Frontend Web App

In a terminal in `./frontend`:

```bash
cd frontend
npm run dev
```

- Open your browser at `http://localhost:5173`
- Click **"Sign In"** and use any of the **"1-Click Fill"** demo buttons for an instant walkthrough!
