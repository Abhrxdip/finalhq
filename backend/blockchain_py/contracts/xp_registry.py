from __future__ import annotations

import base64
import json
import time
from typing import Any

from algosdk import transaction
from algosdk.v2client import algod, indexer

from utils.wallet_helper import connect_wallet


def _resolve_response(result: Any) -> dict[str, Any]:
    if hasattr(result, 'do'):
        return result.do()
    if isinstance(result, dict):
        return result
    raise TypeError('Unsupported SDK response type')


def xp_registry_approval_program() -> str:
    return """
#pragma version 8
txn ApplicationID
int 0
==
bnz init
txn OnCompletion
int NoOp
==
bnz noop
int 0
return
init:
byte \"creator\"
txn Sender
app_global_put
byte \"created_at\"
global LatestTimestamp
app_global_put
int 1
return
noop:
int 1
return
""".strip()


def xp_registry_clear_program() -> str:
    return """
#pragma version 8
int 1
""".strip()


def _compile_program(algod_client: algod.AlgodClient, teal_source: str) -> bytes:
    compiled = algod_client.compile(teal_source)
    result_b64 = compiled.get("result")
    if not result_b64:
        raise RuntimeError("TEAL compilation failed: no result returned.")
    return base64.b64decode(result_b64)


def deploy_xp_registry_app(
    algod_client: algod.AlgodClient,
    admin_private_key: str,
    admin_address: str,
) -> dict[str, Any]:
    connect_wallet(admin_address)

    approval_program = _compile_program(algod_client, xp_registry_approval_program())
    clear_program = _compile_program(algod_client, xp_registry_clear_program())

    params = algod_client.suggested_params()
    txn = transaction.ApplicationCreateTxn(
        sender=admin_address,
        sp=params,
        on_complete=transaction.OnComplete.NoOpOC.real,
        approval_program=approval_program,
        clear_program=clear_program,
        global_schema=transaction.StateSchema(num_uints=1, num_byte_slices=1),
        local_schema=transaction.StateSchema(num_uints=0, num_byte_slices=0),
        note=b"HACKTERA_XP_REGISTRY_DEPLOY",
    )
    signed = txn.sign(admin_private_key)
    tx_id = algod_client.send_transaction(signed)
    confirmation = transaction.wait_for_confirmation(algod_client, tx_id, 10)

    app_id = confirmation.get("application-index")
    if not app_id:
        raise RuntimeError("XP registry deployment failed: no app id returned.")

    return {
        "tx_id": tx_id,
        "app_id": app_id,
        "creator": admin_address,
        "confirmed_round": confirmation.get("confirmed-round"),
    }


def _xp_note_payload(
    user_address: str,
    xp: int,
    quest_id: str,
    app_id: int | None = None,
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "type": "HACKTERA_XP",
        "user_address": user_address,
        "xp_amount": int(xp),
        "quest_id": str(quest_id),
        "timestamp": int(time.time()),
    }
    if app_id is not None:
        payload["app_id"] = int(app_id)
    return payload


def record_xp(
    algod_client: algod.AlgodClient,
    admin_private_key: str,
    admin_address: str,
    user_address: str,
    xp: int,
    quest_id: str,
    app_id: int | None = None,
) -> dict[str, Any]:
    connect_wallet(admin_address)
    connect_wallet(user_address)
    if xp <= 0:
        raise ValueError("xp must be > 0")
    if not str(quest_id).strip():
        raise ValueError("quest_id is required")

    note_payload = _xp_note_payload(user_address, xp, quest_id, app_id)
    note_bytes = json.dumps(note_payload, separators=(",", ":"), ensure_ascii=True).encode("utf-8")

    params = algod_client.suggested_params()
    txn = transaction.PaymentTxn(
        sender=admin_address,
        sp=params,
        receiver=user_address,
        amt=0,
        note=note_bytes,
    )
    signed = txn.sign(admin_private_key)
    tx_id = algod_client.send_transaction(signed)
    confirmation = transaction.wait_for_confirmation(algod_client, tx_id, 10)

    return {
        "tx_id": tx_id,
        "user_wallet": user_address,
        "xp": xp,
        "quest_id": quest_id,
        "confirmed_round": confirmation.get("confirmed-round"),
        "note": note_payload,
    }


def _decode_note(note_b64: str) -> dict[str, Any] | None:
    try:
        raw = base64.b64decode(note_b64)
        payload = json.loads(raw.decode("utf-8"))
    except Exception:
        return None

    if payload.get("type") != "HACKTERA_XP":
        return None
    return payload


def get_user_xp(
    indexer_client: indexer.IndexerClient,
    user_address: str,
    limit: int = 100,
) -> dict[str, Any]:
    connect_wallet(user_address)
    response = _resolve_response(indexer_client.search_transactions(
        address=user_address,
        address_role="receiver",
        limit=limit,
        txn_type="pay",
    ))
    txns = response.get("transactions", [])

    events: list[dict[str, Any]] = []
    total_xp = 0

    for txn in txns:
        note_b64 = txn.get("note")
        if not note_b64:
            continue

        payload = _decode_note(note_b64)
        if not payload:
            continue
        if payload.get("user_address") != user_address:
            continue

        event = {
            "tx_id": txn.get("id"),
            "round": txn.get("confirmed-round"),
            "timestamp": payload.get("timestamp"),
            "quest_id": payload.get("quest_id"),
            "xp": int(payload.get("xp_amount", 0)),
        }
        total_xp += event["xp"]
        events.append(event)

    events.sort(key=lambda e: (e.get("timestamp") or 0, e.get("round") or 0))

    return {
        "user_wallet": user_address,
        "total_xp": total_xp,
        "events": events,
    }