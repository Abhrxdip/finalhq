import json
import time
from typing import Any, List
from algosdk import transaction
from algosdk.v2client import algod, indexer
from utils.wallet_helper import connect_wallet

def record_xp(
    algod_client: algod.AlgodClient,
    admin_private_key: str,
    admin_address: str,
    user_address: str,
    xp_amount: int,
    quest_id: str
) -> dict[str, Any]:
    connect_wallet(user_address)
    params = algod_client.suggested_params()
    
    note_payload = {
        "type": "HACKQUEST_XP",
        "user_address": user_address,
        "xp_amount": xp_amount,
        "quest_id": quest_id,
        "timestamp": int(time.time())
    }
    
    note_json = json.dumps(note_payload).encode("utf-8")
    
    # Create a 0-ALGO payment transaction to record the data
    txn = transaction.PaymentTxn(
        sender=admin_address,
        sp=params,
        receiver=admin_address, # Sending to self to record proof
        amt=0,
        note=note_json
    )
    
    signed_txn = txn.sign(admin_private_key)
    tx_id = algod_client.send_transaction(signed_txn)
    transaction.wait_for_confirmation(algod_client, tx_id, 4)
    
    return {
        "tx_id": tx_id,
        "user_wallet": user_address,
        "xp": xp_amount,
        "quest_id": quest_id
    }

def get_user_xp_history(indexer_client: indexer.IndexerClient, user_address: str) -> List[dict]:
    # Search for transactions sent by admin that contain the user's address in the note
    # Note: In production, you'd filter by admin address and note prefix
    results = indexer_client.search_transactions(
        address=user_address,
        note_prefix=b'{"type":"HACKQUEST_XP"'
    ).do()
    return results.get("transactions", [])