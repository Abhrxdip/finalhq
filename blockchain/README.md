# Hacktera Algorand Layer (`blockchain`)

Python blockchain module for Hacktera backend integration.

## What This Implements

- NFT achievement minting using Algorand Standard Assets (ASA), `total=1`.
- On-chain XP proof using Algorand transaction `note` field.
- Transaction verification support.
- Wallet validation and helper methods.
- Backend-callable scripts that return JSON.

This follows MVP-first priorities:

- MUST HAVE implemented:
  - Mint 1 NFT achievement.
  - Record XP as on-chain note transaction.
  - Return transaction hash and metadata fields for DB persistence.
- SKIPPED intentionally in MVP:
  - Complex on-chain XP stateful contract logic.
  - Auction/trading mechanics.

## Folder Structure

```
blockchain/
├── contracts/
│   ├── nft_achievement.py
│   ├── xp_registry.py
├── scripts/
│   ├── deploy.py
│   ├── mint_nft.py
│   ├── record_xp.py
│   ├── get_user_assets.py
│   ├── verify_tx.py
├── utils/
│   ├── ipfs_helper.py
│   ├── wallet_helper.py
├── config/
│   ├── network_config.py
├── requirements.txt
├── .env.example
└── README.md
```

## Setup

1. Create and activate a virtualenv.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and configure:

- `ALGO_NETWORK=testnet`
- `ALGO_ADMIN_MNEMONIC` (backend-only admin key)
- Optional: `PINATA_JWT`

## Security Model

- Address validation is enforced (`encoding.is_valid_address`).
- Duplicate NFT mint prevention:
  - Checks creator assets by name + URL tag hash.
- Mint/XP scripts require admin mnemonic from env.
- Intended usage: backend executes scripts, frontend never gets admin key.

## Core Functions

### NFT Achievement (`contracts/nft_achievement.py`)

- `create_nft_asset(...)`
- `opt_in_asset(...)`
- `transfer_nft(...)`

ASA settings:

- `total = 1`
- `decimals = 0`
- `metadata_hash = sha256(ipfs://<hash>)`
- `url = ipfs://<hash>#hq:<tag>`

### XP Registry (`contracts/xp_registry.py`)

- `record_xp(user_address, xp, quest_id)`
  - Creates 0-Algo payment with JSON note payload:

```json
{
  "type": "HACKTERA_XP",
  "user_address": "...",
  "xp_amount": 100,
  "quest_id": "quest-1",
  "timestamp": 1712140000
}
```

- `get_user_xp(user_address)`
  - Reads matching note transactions from Indexer.

### Wallet Helper (`utils/wallet_helper.py`)

- `connect_wallet(address)` (validation)
- `sign_transaction(txn, private_key)`
- `send_transaction(algod_client, signed_txn)`
- `verify_transaction(algod_client, tx_id)`

## Backend-Callable Scripts

All scripts print JSON to stdout for easy backend parsing.

### 1) Deploy XP Registry App

```bash
python scripts/deploy.py
```

Returns creator/admin wallet and a real `app_id` from a deployed stateful app.
XP events still use note-field proof in MVP, with optional `app_id` reference in each XP note.

### 2) Mint NFT Achievement

```bash
python scripts/mint_nft.py --json '{"user_wallet":"<WALLET>","nft_name":"Bug Slayer","ipfs_hash":"<IPFS_HASH>"}'
```

Response includes:

- `algo_tx_id`
- `asset_id`
- `user_wallet`
- `mint_tx_id`
- `transfer_tx_id`

### 3) Record XP

```bash
python scripts/record_xp.py --mode record --json '{"user_wallet":"<WALLET>","xp":100,"quest_id":"quest-42","app_id":123456}'
```

Response includes:

- `algo_tx_id`
- `user_wallet`
- `quest_id`
- `xp`

### 4) Get User XP

```bash
python scripts/record_xp.py --mode get --wallet <WALLET>
```

### 5) Get User Assets

```bash
python scripts/get_user_assets.py --wallet <WALLET>
```

### 6) Verify Transaction

```bash
python scripts/verify_tx.py --tx-id <TX_ID>
```

### 7) Demo End-to-End XP Transaction (Mnemonic-Based)

Use your own wallet mnemonic as backend admin signer for a demo test.

PowerShell example:

```powershell
$env:ALGO_ADMIN_MNEMONIC = "<your 25-word mnemonic>"
python scripts/demo_tx_flow.py --xp 25 --quest-id demo-quest
```

Optional (record XP for a specific wallet):

```powershell
python scripts/demo_tx_flow.py --wallet <USER_WALLET_ADDRESS> --xp 25 --quest-id demo-quest
```

The command outputs JSON including tx id, confirmation status, and updated XP summary.

## Node.js Backend Integration (Express Example)

Use `child_process.spawn`/`execFile` to call scripts and parse JSON.

`POST /algo/mint-nft` payload:

```json
{
  "user_wallet": "...",
  "nft_name": "Bug Slayer",
  "ipfs_hash": "..."
}
```

Command:

```bash
python scripts/mint_nft.py --json '<payload-json>'
```

`POST /algo/record-xp` payload:

```json
{
  "user_wallet": "...",
  "xp": 100,
  "quest_id": "...",
  "app_id": 123456
}
```

Command:

```bash
python scripts/record_xp.py --mode record --json '<payload-json>'
```

`GET /algo/user-assets/:wallet`

Command:

```bash
python scripts/get_user_assets.py --wallet <wallet>
```

Suggested DB fields to persist from responses:

- `algo_tx_id`
- `asset_id`
- `user_wallet`
- `quest_id` (XP records)
- `xp` (XP records)
- `app_id` (XP records, optional but recommended)

## Frontend Notes (for your UI/UX teammate)

Frontend wallet signing (Pera Wallet) is separate from backend-admin transactions in this MVP.

- Frontend responsibilities:
  - Connect wallet, display assets, display tx statuses.
- Backend responsibilities:
  - Mint achievement NFTs.
  - Record XP proof transactions.
  - Verify transaction state and persist tx metadata.

If you want direct user-signed opt-in flows from frontend, wire `opt_in_asset(...)` as a separate backend-assisted or client-side flow using WalletConnect/Pera SDK.

## Next Upgrade Path (Post-MVP)

- Replace note-based XP proof with stateful app (box/local/global schema).
- Add role-gated ABI app methods (`record_xp` only callable by admin app account).
- Add retries and idempotency keys in backend for duplicate request protection.
