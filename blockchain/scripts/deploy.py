from __future__ import annotations

import json
import os
import sys

from algosdk import mnemonic

ROOT = os.path.dirname(os.path.dirname(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from config.network_config import build_algod_client, build_indexer_client, get_network_config, require_admin_mnemonic
from contracts.xp_registry import deploy_xp_registry_app
from utils.wallet_helper import address_from_private_key


def deploy() -> dict:
    cfg = get_network_config()
    algod_client = build_algod_client(cfg)
    _ = build_indexer_client(cfg)

    admin_mnemonic = require_admin_mnemonic()
    admin_private_key = mnemonic.to_private_key(admin_mnemonic)
    admin_address = address_from_private_key(admin_private_key)

    xp_registry = deploy_xp_registry_app(
        algod_client=algod_client,
        admin_private_key=admin_private_key,
        admin_address=admin_address,
    )

    return {
        "network": cfg.network,
        "creator_address": admin_address,
        "app_id": xp_registry["app_id"],
        "deploy_tx_id": xp_registry["tx_id"],
        "status": "deployed",
        "notes": [
            "XP proof records are currently stored in payment transaction notes.",
            "XP registry app is deployed for on-chain provenance and future ABI upgrades.",
            "NFT achievements use ASA create + transfer flow.",
        ],
    }


if __name__ == "__main__":
    result = deploy()
    print(json.dumps(result, ensure_ascii=True))