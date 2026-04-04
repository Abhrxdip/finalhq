from __future__ import annotations

from typing import Any

from algosdk import account, encoding, mnemonic, transaction
from algosdk.v2client import algod, indexer


def _resolve_response(result: Any) -> dict[str, Any]:
    if hasattr(result, 'do'):
        return result.do()
    if isinstance(result, dict):
        return result
    raise TypeError('Unsupported SDK response type')


def validate_wallet_address(address: str) -> bool:
    return bool(address) and encoding.is_valid_address(address)


def connect_wallet(address: str) -> str:
    if not validate_wallet_address(address):
        raise ValueError("Invalid Algorand wallet address.")
    return address


def private_key_from_mnemonic(mnemonic_phrase: str) -> str:
    return mnemonic.to_private_key(mnemonic_phrase)


def address_from_private_key(private_key: str) -> str:
    return account.address_from_private_key(private_key)


def sign_transaction(
    unsigned_txn: transaction.Transaction,
    private_key: str,
) -> transaction.SignedTransaction:
    return unsigned_txn.sign(private_key)


def send_transaction(
    algod_client: algod.AlgodClient,
    signed_txn: transaction.SignedTransaction,
    wait_rounds: int = 10,
) -> dict[str, Any]:
    tx_id = algod_client.send_transaction(signed_txn)
    confirmation = transaction.wait_for_confirmation(algod_client, tx_id, wait_rounds)
    return {
        "tx_id": tx_id,
        "confirmed_round": confirmation.get("confirmed-round"),
        "confirmed": bool(confirmation.get("confirmed-round")),
    }


def verify_transaction(
    algod_client: algod.AlgodClient,
    tx_id: str,
) -> dict[str, Any]:
    pending = algod_client.pending_transaction_info(tx_id)
    return {
        "tx_id": tx_id,
        "confirmed": bool(pending.get("confirmed-round", 0)),
        "confirmed_round": pending.get("confirmed-round", 0),
        "pool_error": pending.get("pool-error", ""),
    }


def get_user_assets(
    indexer_client: indexer.IndexerClient,
    wallet_address: str,
    limit: int = 1000,
) -> list[dict[str, Any]]:
    connect_wallet(wallet_address)
    response = _resolve_response(indexer_client.lookup_account_assets(wallet_address, limit=limit))
    return response.get("assets", [])