import argparse
import json
import os
import sys
from algosdk import mnemonic

ROOT = os.path.dirname(os.path.dirname(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from config.network_config import build_algod_client, build_indexer_client, get_network_config, require_admin_mnemonic
from contracts.xp_registry import record_xp, get_user_xp_history
from utils.wallet_helper import address_from_private_key

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["record", "get"], required=True)
    parser.add_argument("--json", help="JSON payload for record mode")
    parser.add_argument("--wallet", help="Wallet address for get mode")
    args = parser.parse_args()

    cfg = get_network_config()
    algod_client = build_algod_client(cfg)
    indexer_client = build_indexer_client(cfg)

    if args.mode == "record":
        payload = json.loads(args.json)
        admin_mnemonic = require_admin_mnemonic()
        admin_pk = mnemonic.to_private_key(admin_mnemonic)
        admin_addr = address_from_private_key(admin_pk)
        
        result = record_xp(
            algod_client, 
            admin_pk, 
            admin_addr, 
            payload["user_wallet"], 
            payload["xp"], 
            payload["quest_id"]
        )
        print(json.dumps(result))
    
    elif args.mode == "get":
        history = get_user_xp_history(indexer_client, args.wallet)
        print(json.dumps({"wallet": args.wallet, "history": history}))

if __name__ == "__main__":
    main()