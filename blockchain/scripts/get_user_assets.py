from __future__ import annotations

import argparse
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from config.network_config import build_indexer_client, get_network_config
from utils.wallet_helper import get_user_assets


def main() -> None:
    parser = argparse.ArgumentParser(description="Get Algorand assets for a wallet")
    parser.add_argument("--wallet", required=True, help="Algorand wallet address")
    args = parser.parse_args()

    cfg = get_network_config()
    indexer_client = build_indexer_client(cfg)
    assets = get_user_assets(indexer_client, args.wallet)

    result = {
        "network": cfg.network,
        "user_wallet": args.wallet,
        "assets": assets,
    }
    print(json.dumps(result, ensure_ascii=True))


if __name__ == "__main__":
    main()
