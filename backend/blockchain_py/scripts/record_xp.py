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
from contracts.xp_registry import get_user_xp, record_xp
from utils.wallet_helper import address_from_private_key, connect_wallet


def _json_arg(value: str) -> dict[str, Any]:
    parsed = json.loads(value)
    if not isinstance(parsed, dict):
        raise ValueError("JSON payload must be an object")
    return parsed


def record_xp_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    user_wallet = connect_wallet(str(payload["user_wallet"]).strip())
    xp = int(payload["xp"])
    quest_id = str(payload["quest_id"]).strip()
    app_id = int(payload["app_id"]) if payload.get("app_id") is not None else None

    cfg = get_network_config()
    algod_client = build_algod_client(cfg)

    admin_mnemonic = require_admin_mnemonic()
    admin_private_key = mnemonic.to_private_key(admin_mnemonic)
    admin_address = address_from_private_key(admin_private_key)

    result = record_xp(
        algod_client=algod_client,
        admin_private_key=admin_private_key,
        admin_address=admin_address,
        user_address=user_wallet,
        xp=xp,
        quest_id=quest_id,
        app_id=app_id,
    )

    return {
        "network": cfg.network,
        "algo_tx_id": result["tx_id"],
        "asset_id": None,
        "user_wallet": user_wallet,
        "quest_id": quest_id,
        "xp": xp,
        "app_id": app_id,
        "recorded_by": admin_address,
    }


def get_user_xp_summary(wallet: str) -> dict[str, Any]:
    user_wallet = connect_wallet(wallet)
    cfg = get_network_config()
    indexer_client = build_indexer_client(cfg)
    return get_user_xp(indexer_client, user_wallet)


def main() -> None:
    parser = argparse.ArgumentParser(description="Record and fetch HackQuest XP proof")
    parser.add_argument("--json", help='JSON payload for record mode, e.g. {"user_wallet":"...","xp":100,"quest_id":"q1"}')
    parser.add_argument("--wallet", help="Wallet address for get mode")
    parser.add_argument("--mode", choices=["record", "get"], default="record")
    args = parser.parse_args()

    if args.mode == "record":
        if not args.json:
            raise ValueError("--json is required for record mode")
        payload = _json_arg(args.json)
        result = record_xp_from_payload(payload)
        print(json.dumps(result, ensure_ascii=True))
        return

    if not args.wallet:
        raise ValueError("--wallet is required for get mode")
    summary = get_user_xp_summary(args.wallet)
    print(json.dumps(summary, ensure_ascii=True))


if __name__ == "__main__":
    main()