from __future__ import annotations

from dataclasses import dataclass
import os

from algosdk.v2client import algod, indexer
from dotenv import load_dotenv

load_dotenv()

DEFAULT_NETWORK = "testnet"
TESTNET_ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
TESTNET_INDEXER_ADDRESS = "https://testnet-idx.algonode.cloud"
LOCALNET_ALGOD_ADDRESS = "http://localhost:4001"
LOCALNET_INDEXER_ADDRESS = "http://localhost:8980"
LOCALNET_DEFAULT_TOKEN = "a" * 64


@dataclass(frozen=True)
class NetworkConfig:
    network: str
    algod_address: str
    algod_token: str
    indexer_address: str
    indexer_token: str


def get_network_config() -> NetworkConfig:
    network = os.getenv("ALGO_NETWORK", DEFAULT_NETWORK).strip().lower()

    if network == "localnet":
        return NetworkConfig(
            network=network,
            algod_address=os.getenv("ALGOD_ADDRESS", LOCALNET_ALGOD_ADDRESS),
            algod_token=os.getenv("ALGOD_TOKEN", LOCALNET_DEFAULT_TOKEN),
            indexer_address=os.getenv("INDEXER_ADDRESS", LOCALNET_INDEXER_ADDRESS),
            indexer_token=os.getenv("INDEXER_TOKEN", LOCALNET_DEFAULT_TOKEN),
        )

    return NetworkConfig(
        network="testnet",
        algod_address=os.getenv("ALGOD_ADDRESS", TESTNET_ALGOD_ADDRESS),
        algod_token=os.getenv("ALGOD_TOKEN", ""),
        indexer_address=os.getenv("INDEXER_ADDRESS", TESTNET_INDEXER_ADDRESS),
        indexer_token=os.getenv("INDEXER_TOKEN", ""),
    )


def build_algod_client(config: NetworkConfig | None = None) -> algod.AlgodClient:
    cfg = config or get_network_config()
    return algod.AlgodClient(cfg.algod_token, cfg.algod_address)


def build_indexer_client(config: NetworkConfig | None = None) -> indexer.IndexerClient:
    cfg = config or get_network_config()
    return indexer.IndexerClient(cfg.indexer_token, cfg.indexer_address)


def require_admin_mnemonic() -> str:
    mnemonic_phrase = os.getenv("ALGO_ADMIN_MNEMONIC") or os.getenv("DEPLOYER_MNEMONIC")
    if not mnemonic_phrase:
        raise ValueError(
            "Missing admin mnemonic. Set ALGO_ADMIN_MNEMONIC (preferred) or DEPLOYER_MNEMONIC."
        )
    return mnemonic_phrase.strip()