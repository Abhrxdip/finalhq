from __future__ import annotations

import hashlib
import os
from typing import Any

import requests

PINATA_API_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS"


def normalize_ipfs_hash(ipfs_hash: str) -> str:
    value = (ipfs_hash or "").strip()
    if not value:
        raise ValueError("IPFS hash is required.")

    if value.startswith("ipfs://"):
        return value[len("ipfs://") :]

    if value.startswith("https://ipfs.io/ipfs/"):
        return value[len("https://ipfs.io/ipfs/") :]

    return value


def ipfs_uri(ipfs_hash: str) -> str:
    return f"ipfs://{normalize_ipfs_hash(ipfs_hash)}"


def asa_metadata_hash_from_ipfs(ipfs_hash: str) -> bytes:
    return hashlib.sha256(ipfs_uri(ipfs_hash).encode("utf-8")).digest()


def build_nft_metadata(
    name: str,
    description: str,
    image: str,
    attributes: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    return {
        "name": name,
        "description": description,
        "image": image,
        "attributes": attributes or [],
    }


def upload_json_to_ipfs(
    metadata: dict[str, Any],
    pinata_jwt: str | None = None,
) -> str:
    jwt = pinata_jwt or os.getenv("PINATA_JWT")
    if not jwt:
        raise ValueError("PINATA_JWT is required to upload metadata to IPFS.")

    response = requests.post(
        PINATA_API_URL,
        headers={"Authorization": f"Bearer {jwt}"},
        json={"pinataContent": metadata},
        timeout=30,
    )
    response.raise_for_status()

    payload = response.json()
    cid = payload.get("IpfsHash")
    if not cid:
        raise RuntimeError("IPFS upload succeeded but no IpfsHash was returned.")

    return cid