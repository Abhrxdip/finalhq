import os
from dataclasses import dataclass
from dotenv import load_dotenv
from algosdk.v2client import algod, indexer

load_dotenv()

@dataclass
class NetworkConfig:
    network: str
    algod_address: str
    algod_token: str
    indexer_address: str
    indexer_token: str

def get_network_config() -> NetworkConfig:
    network = os.getenv("ALGO_NETWORK", "testnet").lower()
    
    # Defaulting to AlgoNode for Testnet (free/no-signup public nodes)
    if network == "testnet":
        return NetworkConfig(
            network="testnet",
            algod_address="https://testnet-api.algonode.cloud",
            algod_token="",
            indexer_address="https://testnet-idx.algonode.cloud",
            indexer_token="",
        )
    # Fallback/Localnet
    return NetworkConfig(
        network="localnet",
        algod_address="http://localhost:4001",
        algod_token="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        indexer_address="http://localhost:8980",
        indexer_token="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    )

def build_algod_client(cfg: NetworkConfig) -> algod.AlgodClient:
    return algod.AlgodClient(cfg.algod_token, cfg.algod_address)

def build_indexer_client(cfg: NetworkConfig) -> indexer.IndexerClient:
    return indexer.IndexerClient(cfg.indexer_token, cfg.indexer_address)

def require_admin_mnemonic() -> str:
    mnemonic = os.getenv("ALGO_ADMIN_MNEMONIC")
    if not mnemonic:
        raise ValueError("ALGO_ADMIN_MNEMONIC is not set in environment.")
    return mnemonic