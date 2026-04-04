import base64

def ipfs_uri(ipfs_hash: str) -> str:
    if ipfs_hash.startswith("ipfs://"):
        return ipfs_hash
    return f"ipfs://{ipfs_hash}"

def asa_metadata_hash_from_ipfs(ipfs_hash: str) -> bytes:
    # For MVP, we use the hash as the 32-byte metadata field.
    # In production, this should be the SHA-256 of the IPFS JSON file content.
    return ipfs_hash[:32].encode("utf-8")