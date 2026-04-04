# HackQuest Backend Architecture for Algorand Integration

This document defines how your Node.js backend should integrate with `blockchain` for TestNet MVP.

## 1. Purpose

Backend must provide:

- NFT achievement minting.
- On-chain XP proof recording.
- Transaction verification and status tracking.
- Read endpoints for user assets and XP history.
- Safe separation of admin signing from frontend wallet interactions.

## 2. High-Level Architecture

```text
Frontend (Pera wallet connect + app UI)
        |
        | HTTPS REST
        v
Node Backend API (Express/Fastify/Nest)
        |
        | child_process / queue worker invocation
        v
blockchain Python scripts
        |
        | Algod + Indexer (TestNet)
        v
Algorand TestNet
```

### Core Principle

- Frontend never sees admin mnemonic.
- Backend is the only signer for mint/XP operations in MVP.

## 3. Components

### 3.1 API Layer (Node)

- Validate input schema.
- Authenticate caller (JWT/session/service-token).
- Authorize role for privileged actions (`mint-nft`, `record-xp`, `deploy`).
- Call Python scripts and parse JSON output.
- Persist operation + transaction metadata in DB.

### 3.2 Blockchain Adapter (Node Service)

Create a single internal service, e.g. `AlgoService`, that wraps script execution:

- `deployXpRegistry()` -> `scripts/deploy.py`
- `mintNft(payload)` -> `scripts/mint_nft.py`
- `recordXp(payload)` -> `scripts/record_xp.py --mode record`
- `getUserAssets(wallet)` -> `scripts/get_user_assets.py`
- `getUserXp(wallet)` -> `scripts/record_xp.py --mode get`
- `verifyTx(txId)` -> `scripts/verify_tx.py`

### 3.3 Worker / Queue (Recommended)

For production-like behavior, run mint/xp as async jobs:

- API enqueues job (`mint_nft`, `record_xp`).
- Worker runs Python script.
- Worker updates DB with result + status.

Suggested queue options: BullMQ, RabbitMQ, SQS.

### 3.4 Database

Use a relational DB (Postgres preferred).

## 4. Data Model (MVP)

## 4.1 `algo_operations`

Stores each backend blockchain action.

Columns:

- `id` (uuid, pk)
- `operation_type` (`DEPLOY_XP_APP` | `MINT_NFT` | `RECORD_XP` | `VERIFY_TX`)
- `status` (`PENDING` | `CONFIRMED` | `FAILED`)
- `request_payload` (jsonb)
- `response_payload` (jsonb)
- `error_message` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## 4.2 `algo_transactions`

Stores chain-visible tx info.

Columns:

- `id` (uuid, pk)
- `algo_tx_id` (text, unique, indexed)
- `asset_id` (bigint, nullable)
- `app_id` (bigint, nullable)
- `user_wallet` (text, indexed)
- `tx_type` (`NFT_MINT` | `NFT_TRANSFER` | `XP_RECORD` | `APP_DEPLOY`)
- `confirmed_round` (bigint, nullable)
- `confirmed` (boolean, default false)
- `quest_id` (text, nullable)
- `xp` (int, nullable)
- `created_at` (timestamp)

## 4.3 `user_achievements`

Maps product achievements to chain assets.

Columns:

- `id` (uuid, pk)
- `user_wallet` (text, indexed)
- `achievement_key` (text)  
  Example: `first_quest_completed`, `xp_1000`, `hackathon_winner`
- `nft_name` (text)
- `asset_id` (bigint, unique)
- `mint_tx_id` (text)
- `transfer_tx_id` (text)
- `ipfs_hash` (text)
- `created_at` (timestamp)

Unique constraint:

- `(user_wallet, achievement_key)` to prevent duplicate mints at backend level.

## 5. Endpoint Contract (Backend)

## 5.1 POST `/algo/deploy`

Purpose:

- Deploy minimal XP registry app.

Response:

- `network`
- `creator_address`
- `app_id`
- `deploy_tx_id`

## 5.2 POST `/algo/mint-nft`

Request:

```json
{
  "user_wallet": "...",
  "nft_name": "Bug Slayer",
  "ipfs_hash": "bafy...",
  "achievement_key": "bug_slayer"
}
```

Backend flow:

1. Validate wallet + payload.
2. Check `user_achievements` uniqueness by `(user_wallet, achievement_key)`.
3. Invoke `mint_nft.py`.
4. Persist tx rows and achievement row.
5. Return tx IDs + asset ID.

## 5.3 POST `/algo/record-xp`

Request:

```json
{
  "user_wallet": "...",
  "xp": 100,
  "quest_id": "quest-42",
  "app_id": 123456
}
```

Backend flow:

1. Validate payload.
2. Idempotency check (`user_wallet + quest_id`).
3. Invoke `record_xp.py`.
4. Persist transaction.
5. Return `algo_tx_id`.

## 5.4 GET `/algo/user-assets/:wallet`

- Calls `get_user_assets.py`.
- Returns list of ASA holdings for UI.

## 5.5 GET `/algo/user-xp/:wallet`

- Calls `record_xp.py --mode get`.
- Returns parsed XP event history.

## 5.6 GET `/algo/verify-tx/:txId`

- Calls `verify_tx.py`.
- Updates `algo_transactions.confirmed` when confirmation is found.

## 6. Security Requirements

## 6.1 Secrets

Store only in backend env or secret manager:

- `ALGO_ADMIN_MNEMONIC`
- Optional: `PINATA_JWT`

Never expose in:

- frontend bundle
- logs
- API responses

## 6.2 Access Control

- Protect `/algo/deploy`, `/algo/mint-nft`, `/algo/record-xp` as admin/service endpoints.
- Optional: signed internal service token for game engine/job processor.

## 6.3 Input Validation

- Validate Algorand addresses before processing.
- Ensure `xp > 0` and bounded max (e.g. `xp <= 100000`).
- Limit `nft_name` length and sanitize text fields.

## 6.4 Anti-Duplicate Strategy

Layered protection:

- DB uniqueness (`user_wallet`, `achievement_key`).
- Script-level duplicate check in `mint_nft.py`.
- Optional idempotency key header (`Idempotency-Key`) for write APIs.

## 7. Reliability and Retry

## 7.1 Job States

- `PENDING` -> queued/running
- `CONFIRMED` -> tx confirmed
- `FAILED` -> script/network/validation failure

## 7.2 Retry Policy

Retry only for transient errors:

- Algod timeout
- network interruptions
- indexer temporary failure

Do not retry for deterministic failures:

- invalid wallet
- duplicate achievement
- missing required fields

Recommended backoff:

- 3 retries with exponential delay (2s, 5s, 15s)

## 8. Observability

Log fields for every operation:

- `operation_id`
- `operation_type`
- `user_wallet`
- `algo_tx_id`
- `asset_id`
- `app_id`
- `status`
- `error_code`

Expose metrics:

- `algo_mint_success_total`
- `algo_mint_failure_total`
- `algo_xp_success_total`
- `algo_xp_failure_total`
- `algo_tx_confirmation_seconds`

## 9. Environment Configuration

Required env for backend process:

- `ALGO_NETWORK=testnet`
- `ALGO_ADMIN_MNEMONIC=...`
- `ALGOD_ADDRESS=https://testnet-api.algonode.cloud`
- `ALGOD_TOKEN=`
- `INDEXER_ADDRESS=https://testnet-idx.algonode.cloud`
- `INDEXER_TOKEN=`

Runtime helper env:

- `PYTHON_BIN` for selecting Python executable used by Node adapter.

## 10. Suggested Backend Folder Layout

```text
backend/
├── src/
│   ├── modules/algo/
│   │   ├── algo.controller.ts
│   │   ├── algo.service.ts
│   │   ├── algo.worker.ts
│   │   ├── algo.schemas.ts
│   │   └── algo.repository.ts
│   ├── infra/python/
│   │   └── script-runner.ts
│   └── infra/queue/
├── migrations/
└── .env
```

## 11. Integration Checklist

- [ ] Backend env configured with admin mnemonic.
- [ ] DB tables for operations/transactions/achievements created.
- [ ] Script runner implemented with timeout and JSON parsing.
- [ ] Admin auth middleware enabled on write endpoints.
- [ ] Idempotency for mint/xp endpoints implemented.
- [ ] Background tx verification job scheduled.
- [ ] Frontend reads wallet, assets, XP history from backend APIs.

## 12. MVP vs Next Phase

MVP (current):

- NFT = ASA mint + transfer.
- XP proof = note transaction.
- Registry app deployed for provenance/future expansion.

Next phase:

- Full ABI-based XP stateful app methods (`record_xp`, `get_user_xp` on-chain).
- Event indexing service for near real-time dashboards.
- Multi-admin signing policy (KMS/HSM or multisig).
