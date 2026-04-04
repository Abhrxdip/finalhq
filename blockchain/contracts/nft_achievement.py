from __future__ import annotations

import hashlib
import json
from typing import Any

from algosdk import transaction
from algosdk.v2client import algod, indexer

from utils.ipfs_helper import asa_metadata_hash_from_ipfs, ipfs_uri
from utils.wallet_helper import connect_wallet


def _resolve_response(result: Any) -> dict[str, Any]:
    if hasattr(result, 'do'):
        return result.do()
    if isinstance(result, dict):
        return result
    raise TypeError('Unsupported SDK response type')


def _achievement_tag(name: str, ipfs_hash: str) -> str:
    seed = f"{name.strip().lower()}::{ipfs_uri(ipfs_hash)}"
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    return digest[:16]


def _asset_name_for_chain(name: str) -> str:
    trimmed = (name or "").strip()
    if not trimmed:
        raise ValueError("nft_name is required.")
    return trimmed[:32]


def _asset_url_with_tag(name: str, ipfs_hash: str) -> str:
    tag = _achievement_tag(name, ipfs_hash)
    base = ipfs_uri(ipfs_hash)
    return f"{base}#hq:{tag}"[:96]


def _has_duplicate_nft(
    indexer_client: indexer.IndexerClient,
    admin_address: str,
    nft_name: str,
    ipfs_hash: str,
) -> bool:
    asset_name = _asset_name_for_chain(nft_name)
    tagged_url = _asset_url_with_tag(nft_name, ipfs_hash)
    results = _resolve_response(indexer_client.search_assets(
        creator=admin_address,
        name=asset_name,
        limit=100,
    ))
    assets = results.get("assets", [])

    for asset in assets:
        params = asset.get("params", {})
        if params.get("url") == tagged_url:
            return True
    return False


def user_has_achievement_nft(
    indexer_client: indexer.IndexerClient,
    user_address: str,
    creator_address: str,
    nft_name: str,
    ipfs_hash: str,
) -> bool:
    connect_wallet(user_address)
    tagged_url = _asset_url_with_tag(nft_name, ipfs_hash)

    holdings = _resolve_response(indexer_client.lookup_account_assets(user_address, limit=1000)).get("assets", [])
    for holding in holdings:
        amount = int(holding.get("amount", 0))
        asset_id = holding.get("asset-id")
        if amount <= 0 or not asset_id:
            continue

        asset = _resolve_response(indexer_client.lookup_asset_by_id(asset_id)).get("asset", {})
        params = asset.get("params", {})
        if params.get("creator") != creator_address:
            continue
        if params.get("url") == tagged_url:
            return True
    return False


def create_nft_asset(
    algod_client: algod.AlgodClient,
    indexer_client: indexer.IndexerClient,
    admin_private_key: str,
    admin_address: str,
    nft_name: str,
    ipfs_hash: str,
    unit_name: str = "HQNFT",
) -> dict[str, Any]:
    connect_wallet(admin_address)

    if _has_duplicate_nft(indexer_client, admin_address, nft_name, ipfs_hash):
        raise ValueError("Duplicate NFT prevented: this achievement NFT already exists.")

    suggested_params = algod_client.suggested_params()
    metadata_hash = asa_metadata_hash_from_ipfs(ipfs_hash)
    asset_url = _asset_url_with_tag(nft_name, ipfs_hash)

    txn = transaction.AssetConfigTxn(
        sender=admin_address,
        sp=suggested_params,
        total=1,
        decimals=0,
        default_frozen=False,
        unit_name=unit_name[:8],
        asset_name=_asset_name_for_chain(nft_name),
        manager=admin_address,
        reserve=admin_address,
        freeze=admin_address,
        clawback=admin_address,
        strict_empty_address_check=False,
        url=asset_url,
        metadata_hash=metadata_hash,
    )
    signed = txn.sign(admin_private_key)
    tx_id = algod_client.send_transaction(signed)
    confirmation = transaction.wait_for_confirmation(algod_client, tx_id, 10)

    asset_id = confirmation.get("asset-index")
    if not asset_id:
        raise RuntimeError("Asset creation failed: no asset id returned.")

    return {
        "tx_id": tx_id,
        "asset_id": asset_id,
        "creator": admin_address,
        "asset_name": _asset_name_for_chain(nft_name),
        "asset_url": asset_url,
    }


def opt_in_asset(
    algod_client: algod.AlgodClient,
    user_private_key: str,
    user_address: str,
    asset_id: int,
) -> dict[str, Any]:
    connect_wallet(user_address)
    params = algod_client.suggested_params()
    txn = transaction.AssetTransferTxn(
        sender=user_address,
        sp=params,
        receiver=user_address,
        amt=0,
        index=asset_id,
    )
    signed = txn.sign(user_private_key)
    tx_id = algod_client.send_transaction(signed)
    confirmation = transaction.wait_for_confirmation(algod_client, tx_id, 10)
    return {
        "tx_id": tx_id,
        "asset_id": asset_id,
        "user_wallet": user_address,
        "confirmed_round": confirmation.get("confirmed-round"),
    }


def transfer_nft(
    algod_client: algod.AlgodClient,
    admin_private_key: str,
    admin_address: str,
    to_address: str,
    asset_id: int,
) -> dict[str, Any]:
    connect_wallet(admin_address)
    connect_wallet(to_address)

    params = algod_client.suggested_params()
    txn = transaction.AssetTransferTxn(
        sender=admin_address,
        sp=params,
        receiver=to_address,
        amt=1,
        index=asset_id,
    )
    signed = txn.sign(admin_private_key)
    tx_id = algod_client.send_transaction(signed)
    confirmation = transaction.wait_for_confirmation(algod_client, tx_id, 10)
    return {
        "tx_id": tx_id,
        "asset_id": asset_id,
        "from": admin_address,
        "to": to_address,
        "confirmed_round": confirmation.get("confirmed-round"),
    }


def serialize_achievement_note(payload: dict[str, Any]) -> bytes:
    return json.dumps(payload, separators=(",", ":"), ensure_ascii=True).encode("utf-8")