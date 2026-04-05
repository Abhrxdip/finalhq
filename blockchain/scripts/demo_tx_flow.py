from __future__ import annotations

import argparse
import json
import os
import sys

from algosdk import mnemonic

ROOT = os.path.dirname(os.path.dirname(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from config.network_config import build_algod_client, build_indexer_client, get_network_config, require_admin_mnemonic
from contracts.xp_registry import get_user_xp, record_xp
from utils.wallet_helper import address_from_private_key, connect_wallet, verify_transaction


def run_demo_flow(user_wallet: str | None, xp: int, quest_id: str) -> dict:
    if xp <= 0:
        raise ValueError("xp must be > 0")
    if not quest_id.strip():
        raise ValueError("quest_id is required")

    cfg = get_network_config()
    algod_client = build_algod_client(cfg)
    indexer_client = build_indexer_client(cfg)

    admin_mnemonic = require_admin_mnemonic()
    admin_private_key = mnemonic.to_private_key(admin_mnemonic)
    admin_wallet = address_from_private_key(admin_private_key)

    target_wallet = connect_wallet(user_wallet.strip()) if user_wallet else admin_wallet

    record_result = record_xp(
        algod_client=algod_client,
        admin_private_key=admin_private_key,
        admin_address=admin_wallet,
        user_address=target_wallet,
        xp=xp,
        quest_id=quest_id,
        app_id=None,
    )

    verification = verify_transaction(algod_client, record_result["tx_id"])
    xp_summary = get_user_xp(indexer_client, target_wallet)

    return {
        "network": cfg.network,
        "admin_wallet": admin_wallet,
        "user_wallet": target_wallet,
        "quest_id": quest_id,
        "xp": xp,
        "record": {
            "tx_id": record_result["tx_id"],
            "confirmed_round": record_result.get("confirmed_round"),
        },
        "verification": verification,
        "xp_summary": {
            "total_xp": xp_summary.get("total_xp", 0),
            "events_count": len(xp_summary.get("events", [])),
        },
        "notes": [
            "This demo records XP using an on-chain payment note transaction.",
            "Marketplace buy/sell smart contract flow is not implemented in this MVP layer.",
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Hacktera blockchain demo XP flow")
    parser.add_argument("--wallet", help="User wallet address; defaults to admin wallet from mnemonic")
    parser.add_argument("--xp", type=int, default=25, help="XP amount to record")
    parser.add_argument("--quest-id", default="demo-quest", help="Quest identifier")
    args = parser.parse_args()

    result = run_demo_flow(args.wallet, args.xp, args.quest_id)
    print(json.dumps(result, ensure_ascii=True))


if __name__ == "__main__":
    main()
