from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any

from algosdk import mnemonic

ROOT = os.path.dirname(os.path.dirname(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from config.network_config import build_algod_client, build_indexer_client, get_network_config, require_admin_mnemonic
from contracts.nft_achievement import create_nft_asset, transfer_nft, user_has_achievement_nft
from utils.wallet_helper import address_from_private_key, connect_wallet


def _json_arg(value: str) -> dict[str, Any]:
    parsed = json.loads(value)
    if not isinstance(parsed, dict):
        raise ValueError("JSON payload must be an object")
    return parsed


def mint_nft_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    user_wallet = connect_wallet(str(payload["user_wallet"]).strip())
    nft_name = str(payload["nft_name"]).strip()
    ipfs_hash = str(payload["ipfs_hash"]).strip()

    cfg = get_network_config()
    algod_client = build_algod_client(cfg)
    indexer_client = build_indexer_client(cfg)

    admin_mnemonic = require_admin_mnemonic()
    admin_private_key = mnemonic.to_private_key(admin_mnemonic)
    admin_address = address_from_private_key(admin_private_key)

    if user_has_achievement_nft(indexer_client, user_wallet, admin_address, nft_name, ipfs_hash):
        raise ValueError("Duplicate NFT prevented: user already has this achievement NFT.")

    create_result = create_nft_asset(
        algod_client=algod_client,
        indexer_client=indexer_client,
        admin_private_key=admin_private_key,
        admin_address=admin_address,
        nft_name=nft_name,
        ipfs_hash=ipfs_hash,
    )

    transfer_result = transfer_nft(
        algod_client=algod_client,
        admin_private_key=admin_private_key,
        admin_address=admin_address,
        to_address=user_wallet,
        asset_id=int(create_result["asset_id"]),
    )

    return {
        "network": cfg.network,
        "algo_tx_id": transfer_result["tx_id"],
        "asset_id": create_result["asset_id"],
        "user_wallet": user_wallet,
        "creator_wallet": admin_address,
        "mint_tx_id": create_result["tx_id"],
        "transfer_tx_id": transfer_result["tx_id"],
        "nft_name": nft_name,
        "ipfs_hash": ipfs_hash,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Mint and transfer HackQuest NFT achievement")
    parser.add_argument(
        "--json",
        required=True,
        help='JSON payload, e.g. {"user_wallet":"...","nft_name":"Bug Slayer","ipfs_hash":"..."}',
    )
    args = parser.parse_args()

    payload = _json_arg(args.json)
    result = mint_nft_from_payload(payload)
    print(json.dumps(result, ensure_ascii=True))


if __name__ == "__main__":
    main()