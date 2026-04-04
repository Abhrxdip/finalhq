# HackQuest Backend

Hackathon-ready backend for HackQuest (The Hackathon Meta Game), built with:

- Node.js + Express
- PostgreSQL (existing schema)
- JWT auth + password hashing
- Socket.IO (real-time events)
- algosdk (Algorand proofs and NFT mint hooks)
- bundled Python blockchain runtime (`blockchain_py`)

## Structure

```
src/
  app.js
  server.js
  controllers/
  db/
  routes/
  services/
  sockets/
  utils/
public/
  dummy/
postman/
  HackQuest-Algo.postman_collection.json
  HackQuest-Algo.postman_environment.json
```

This folder is a standalone backend repository and can be deployed independently.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file from example:

```bash
cp .env.example .env
```

3. Update `.env` values for your PostgreSQL and Algorand setup.

4. Install Python blockchain dependencies (required for real on-chain calls):

```bash
python -m pip install -r blockchain_py/requirements.txt
```

5. Start the server:

```bash
npm run dev
```

## Environment Variables

- `PORT` - API port
- `DATABASE_URL` - PostgreSQL connection string
- `PGSSL` - `true` or `false`
- `CORS_ORIGIN` - `*` or comma-separated origins
- `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_ISSUER` - auth token settings
- `PASSWORD_SALT_ROUNDS` - bcrypt rounds
- `ADMIN_EMAILS` - comma-separated emails that should register as `admin`
- `XP_PER_LEVEL` - XP threshold for each level
- `ALGORAND_NETWORK` - `testnet`/`mainnet` label
- `ALGOD_SERVER`, `ALGOD_PORT`, `ALGOD_TOKEN` - Algod config
- `ALGORAND_MNEMONIC` - signing account mnemonic
- `ALGO_ADMIN_MNEMONIC` - preferred admin mnemonic for python scripts (falls back to `ALGORAND_MNEMONIC`)
- `INDEXER_SERVER`, `INDEXER_TOKEN` - Indexer config
- `ALGO_XP_APP_ID` - optional deployed XP app id for XP records
- `ALGO_STRICT` - if `true`, blockchain actions fail without mnemonic
- `PYTHON_BIN` - python executable path, e.g. `c:/Users/abhra/Documents/HackQuest/.venv/Scripts/python.exe`
- `ALGO_SCRIPTS_DIR` - optional absolute path override for blockchain scripts
- `PYTHON_TIMEOUT_MS` - timeout for python script execution

When mnemonic is not provided and strict mode is false, blockchain actions are simulated with deterministic tx IDs so demo flow still works.

## Core Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/link-wallet`
- `POST /api/auth/logout`
- `GET /api/users/:userId`
- `GET /api/users/wallet?wallet=<ALGO_WALLET>`
- `GET /api/events`
- `GET /api/events/:eventId`
- `GET /api/quests?eventId=<eventId>&userId=<userId>`
- `GET /api/quests/progress/:userId?eventId=<eventId>`
- `POST /api/quests/complete`
- `GET /api/leaderboard`
- `GET /api/activity`
- `GET /api/nfts/user/:userId`
- `POST /api/algo/deploy`
- `POST /api/algo/mint-nft`
- `POST /api/algo/record-xp`
- `GET /api/algo/user-assets/:wallet`
- `GET /api/algo/user-xp/:wallet`
- `GET /api/algo/verify-tx/:txId`

## Critical Quest Completion Flow

`POST /api/quests/complete`

Body:

```json
{
  "userId": "<uuid>",
  "questId": "<uuid>"
}
```

Transaction flow:

1. Fetch and lock user + quest.
2. Upsert completion in `quest_progress`.
3. Add XP to `users.total_xp` + update level.
4. Insert `xp_logs` (with optional `algo_tx_id` proof).
5. Update `event_participants.xp_earned`.
6. Insert `activity_feed` entry.
7. Recompute and broadcast leaderboard.
8. Evaluate milestone triggers and mint NFT (if triggered).

## Blockchain Trigger Rules

Algorand calls are triggered only for major milestones:

- First completed quest
- XP milestones: 100, 500, 1000
- Event completion (all quests in event completed)
- Top leaderboard ranks (1-3)

Proof tx IDs are stored in:

- `xp_logs.algo_tx_id`
- `nft_ownership.algo_audit_tx`

## Socket Events

- `leaderboard:update`
- `activity:update`
- `nft:minted`

## Blockchain Bridge (Connected)

This backend now calls the Python blockchain module in `backend/blockchain_py/scripts` for real TestNet operations (host-friendly, no monorepo sibling path required):

- NFT mint -> `scripts/mint_nft.py`
- XP record -> `scripts/record_xp.py --mode record`
- XP app deploy -> `scripts/deploy.py`
- Asset lookup -> `scripts/get_user_assets.py`
- Tx verify -> `scripts/verify_tx.py`

If script execution fails and `ALGO_STRICT=false`, backend returns simulated tx ids to keep demo flow alive.
Set `ALGO_STRICT=true` for strict live-chain behavior.

## Authentication and Roles

- Register/login is JWT-based.
- Protected endpoints require `Authorization: Bearer <token>`.
- `/api/algo/deploy` is `admin` only.
- To make an account admin, either:
  - include its email in `ADMIN_EMAILS`, then register that account, or
  - update `auth_users.role` to `admin` directly in PostgreSQL.

## Dummy Frontend For Testing

A test frontend is bundled and served by backend:

- URL: `/dummy`
- Provides:
  - Pera connect button
  - Deploy XP app
  - Mint NFT
  - Record XP
  - Fetch assets / XP
  - Verify tx

### Run End-to-End (TestNet)

1. Ensure Python deps are installed in backend runtime:

```bash
python -m pip install -r blockchain_py/requirements.txt
```

2. Configure backend `.env`:

```env
ALGO_STRICT=true
ALGORAND_NETWORK=testnet
ALGO_ADMIN_MNEMONIC=<your 25-word mnemonic>
PYTHON_BIN=c:/Users/abhra/Documents/HackQuest/.venv/Scripts/python.exe
ADMIN_EMAILS=admin@hackquest.io
```

3. Start backend:

```bash
npm run dev
```

4. Open:

```
http://localhost:4000/dummy
```

5. Test sequence:

- Connect/paste wallet
- Deploy XP app
- Mint NFT (name + ipfs hash)
- Record XP
- Verify tx
- Fetch assets and XP history

## Required Environment Variables (Deployment)

Minimum for backend startup:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`

Minimum for real blockchain writes on TestNet:

- `ALGO_STRICT=true`
- `ALGORAND_NETWORK=testnet`
- `ALGO_ADMIN_MNEMONIC=<25-word mnemonic>`
- `PYTHON_BIN=<absolute python path>`

Recommended for stable connectivity:

- `ALGOD_SERVER=https://testnet-api.algonode.cloud`
- `ALGOD_TOKEN=`
- `INDEXER_SERVER=https://testnet-idx.algonode.cloud`
- `INDEXER_TOKEN=`
- `ALGO_SCRIPTS_DIR=<absolute path override if not using bundled blockchain_py/scripts>`
- `PYTHON_TIMEOUT_MS=60000`
- `DEFAULT_NFT_IPFS_HASH=<fallback ipfs hash>`

Optional:

- `ALGO_XP_APP_ID=<deployed app id>`
- `DEPLOYER_MNEMONIC=<fallback for python layer>`

## Deploy (Docker)

This folder now includes a production Dockerfile that installs Node + Python deps.

```bash
docker build -t hackquest-backend .
docker run --rm -p 4000:4000 --env-file .env hackquest-backend
```

For cloud platforms (Render/Railway/Fly.io), deploy from the `backend` folder using this Dockerfile and set all required env vars.

## Frontend Requirements

Frontend should provide these values to backend routes:

- Wallet address (`userWallet`) from Pera Connect
- NFT mint payload:
  - `userWallet`
  - `nftName`
  - `ipfsHash`
- XP payload:
  - `userWallet`
  - `xp`
  - `questId`
  - optional `appId`

Frontend API calls needed:

- `POST /api/algo/deploy`
- `POST /api/algo/mint-nft`
- `POST /api/algo/record-xp`
- `GET /api/algo/user-assets/:wallet`
- `GET /api/algo/user-xp/:wallet`
- `GET /api/algo/verify-tx/:txId`

Use returned fields in UI:

- `result.txId` for explorer links
- `result.assetId` for NFT display
- `result.simulated` to warn user if action was not on-chain

## Postman

Import these files from `postman/`:

- `HackQuest-Algo.postman_collection.json`
- `HackQuest-Algo.postman_environment.json`

Recommended test order:

1. `Health`
2. `Algo - Deploy XP Registry`
3. `Algo - Mint NFT`
4. `Algo - Record XP`
5. `Algo - Verify TX`
6. `Algo - Get User Assets`
7. `Algo - Get User XP`
