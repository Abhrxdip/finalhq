# Hacktera Deployment Layout

This README defines a deployment-focused structure with only two top-level services:

- `backend` (Node.js API)
- `blockchain` (Python Algorand execution layer)

The project has been arranged in this structure in the current workspace.

## Target Deployment Structure

```text
.
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── db/
│   │   ├── sockets/
│   │   └── utils/
│   ├── postman/
│   ├── public/
│   │   └── dummy/
│   └── frontend/
└── blockchain/
    ├── .env.example
    ├── requirements.txt
    ├── config/
    │   └── network_config.py
    ├── contracts/
    │   ├── nft_achievement.py
    │   └── xp_registry.py
    ├── scripts/
    │   ├── deploy.py
    │   ├── mint_nft.py
    │   ├── record_xp.py
    │   ├── get_user_assets.py
    │   └── verify_tx.py
    ├── utils/
    │   ├── ipfs_helper.py
    │   └── wallet_helper.py
    └── contracts-ts/
```

## Backend File Structure Explained

- `src/app.js`: Express app setup (middleware + route registration).
- `src/server.js`: HTTP server bootstrap and process startup.
- `src/controllers/`: Request handlers per domain (`quests`, `nfts`, `leaderboard`, `blockchain`, etc.).
- `src/routes/`: API route declarations and controller binding.
- `src/services/`: Business logic and orchestration (DB + blockchain calls).
- `src/db/`: PostgreSQL client and data access entry points.
- `src/sockets/`: Socket.IO setup and real-time event wiring.
- `src/utils/`: Shared helpers (response handling, HTTP helpers).
- `frontend/`: React frontend project moved under backend for consolidated app packaging.
- `postman/`: Prebuilt API testing collection and environment.
- `public/dummy/`: Test UI for wallet + blockchain flow verification.

## Blockchain File Structure Explained

- `contracts/nft_achievement.py`: ASA NFT mint/transfer helpers for achievements.
- `contracts/xp_registry.py`: XP note transaction logic and XP read helpers.
- `scripts/deploy.py`: Deploys XP registry app and returns deployment metadata.
- `scripts/mint_nft.py`: CLI entry for backend-triggered NFT minting.
- `scripts/record_xp.py`: CLI entry for XP record/get flows.
- `scripts/get_user_assets.py`: Fetches account ASA holdings.
- `scripts/verify_tx.py`: Transaction confirmation and status checks.
- `utils/ipfs_helper.py`: Metadata upload/normalization helpers.
- `utils/wallet_helper.py`: Address validation + transaction signing helpers.
- `config/network_config.py`: Network endpoint and client configuration.
- `contracts-ts/`: TypeScript smart contract project moved under blockchain.

## Deployment Setup

### 1) Backend

```bash
cd backend
npm install
# PowerShell
Copy-Item .env.example .env

# Bash
cp .env.example .env
```

Set at minimum:

- `PORT`
- `DATABASE_URL`
- `ALGO_STRICT=true` (for real on-chain writes)
- `ALGO_ADMIN_MNEMONIC`
- `PYTHON_BIN`
- `ALGO_SCRIPTS_DIR` (absolute path to `blockchain/scripts`)

### 2) Blockchain

```bash
cd blockchain
python -m venv .venv
# PowerShell
.\.venv\Scripts\Activate.ps1

# Bash
source .venv/Scripts/activate
pip install -r requirements.txt

# PowerShell
Copy-Item .env.example .env

# Bash
cp .env.example .env
```

Set at minimum:

- `ALGO_NETWORK=testnet`
- `ALGOD_ADDRESS`
- `INDEXER_ADDRESS`
- `ALGO_ADMIN_MNEMONIC`

### 3) Run Backend

```bash
cd backend
npm run dev
```

Backend will invoke blockchain scripts for:

- NFT minting
- XP recording
- User asset lookup
- Transaction verification

## Production Notes

- Keep admin mnemonic only in backend/server-side secrets.
- Protect write routes (`/algo/deploy`, `/algo/mint-nft`, `/algo/record-xp`) with auth.
- Add queue-based execution for blockchain writes in high-traffic environments.
- Persist tx metadata (`algo_tx_id`, `asset_id`, `app_id`, `confirmed_round`) for auditability.
