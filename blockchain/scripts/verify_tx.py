from __future__ import annotations

import argparse
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from config.network_config import build_algod_client, get_network_config
from utils.wallet_helper import verify_transaction


def main() -> None:
    parser = argparse.ArgumentParser(description="Verify Algorand transaction status")
    parser.add_argument("--tx-id", required=True, help="Algorand transaction ID")
    args = parser.parse_args()

    cfg = get_network_config()
    algod_client = build_algod_client(cfg)
    status = verify_transaction(algod_client, args.tx_id)
    status["network"] = cfg.network
    print(json.dumps(status, ensure_ascii=True))


if __name__ == "__main__":
    main()
