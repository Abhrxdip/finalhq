const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

const strictMode = process.env.ALGO_STRICT === 'true';
const defaultNetwork = process.env.ALGO_NETWORK || process.env.ALGORAND_NETWORK || 'testnet';
const pythonBin = process.env.PYTHON_BIN || 'python';
const scriptTimeoutMs = Number(process.env.PYTHON_TIMEOUT_MS || 60000);
const bundledScriptsDir = path.resolve(__dirname, '../../blockchain_py/scripts');
const monorepoScriptsDir = path.resolve(__dirname, '../../..', 'blockchain', 'scripts');
const scriptsDir =
  process.env.ALGO_SCRIPTS_DIR ||
  (fs.existsSync(bundledScriptsDir) ? bundledScriptsDir : monorepoScriptsDir);
const defaultIpfsHash =
  process.env.DEFAULT_NFT_IPFS_HASH ||
  'bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku';

const scriptExists = (scriptName) => fs.existsSync(path.join(scriptsDir, scriptName));

const buildChildEnv = () => {
  const childEnv = { ...process.env };

  if (!childEnv.ALGO_ADMIN_MNEMONIC && childEnv.ALGORAND_MNEMONIC) {
    childEnv.ALGO_ADMIN_MNEMONIC = childEnv.ALGORAND_MNEMONIC;
  }
  if (!childEnv.ALGO_NETWORK && childEnv.ALGORAND_NETWORK) {
    childEnv.ALGO_NETWORK = childEnv.ALGORAND_NETWORK;
  }
  if (!childEnv.ALGOD_ADDRESS && childEnv.ALGOD_SERVER) {
    childEnv.ALGOD_ADDRESS = childEnv.ALGOD_SERVER;
  }
  if (!childEnv.INDEXER_ADDRESS && childEnv.INDEXER_SERVER) {
    childEnv.INDEXER_ADDRESS = childEnv.INDEXER_SERVER;
  }

  return childEnv;
};

const buildSimulatedTxId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 12)}`;

const parseJsonOutput = (scriptName, stdout, stderr = '') => {
  const output = String(stdout || '').trim();
  if (!output) {
    throw new Error(`No output from ${scriptName}${stderr ? `: ${stderr}` : ''}`);
  }

  const lines = output.split(/\r?\n/).filter(Boolean);
  const candidate = lines[lines.length - 1];

  try {
    return JSON.parse(candidate);
  } catch (error) {
    throw new Error(`Non-JSON output from ${scriptName}: ${output}`);
  }
};

const runPythonScript = async (scriptName, args = []) => {
  const scriptPath = path.join(scriptsDir, scriptName);
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Missing blockchain script: ${scriptPath}`);
  }

  try {
    const { stdout, stderr } = await execFileAsync(pythonBin, [scriptPath, ...args], {
      cwd: scriptsDir,
      env: buildChildEnv(),
      timeout: scriptTimeoutMs,
      maxBuffer: 1024 * 1024,
    });

    return parseJsonOutput(scriptName, stdout, stderr);
  } catch (error) {
    if (error.stdout || error.stderr) {
      const details = [String(error.message || ''), String(error.stderr || ''), String(error.stdout || '')]
        .filter(Boolean)
        .join('\n');
      throw new Error(details);
    }
    throw error;
  }
};

const extractIpfsHash = (value) => {
  const raw = String(value || '').trim();
  if (!raw) {
    return null;
  }
  if (raw.startsWith('ipfs://')) {
    return raw.slice('ipfs://'.length);
  }
  const marker = '/ipfs/';
  const markerIndex = raw.indexOf(marker);
  if (markerIndex >= 0) {
    return raw.slice(markerIndex + marker.length);
  }
  return raw;
};

const resolveNftIpfsHash = (definition, quest) => {
  const candidates = [
    definition && definition.ipfs_hash,
    definition && definition.metadata_ipfs_hash,
    definition && definition.image_url,
    quest && quest.ipfs_hash,
    quest && quest.image_url,
  ];

  for (const candidate of candidates) {
    const parsed = extractIpfsHash(candidate);
    if (parsed) {
      return parsed;
    }
  }

  return defaultIpfsHash;
};

const maybeSimulateOrThrow = (prefix, error, extra = {}) => {
  if (strictMode) {
    throw error;
  }

  return {
    txId: buildSimulatedTxId(prefix),
    network: defaultNetwork,
    simulated: true,
    error: error.message,
    ...extra,
  };
};

const deployXpRegistry = async () => {
  try {
    const raw = await runPythonScript('deploy.py');
    return {
      txId: raw.deploy_tx_id || null,
      appId: raw.app_id || null,
      creatorAddress: raw.creator_address || null,
      network: raw.network || defaultNetwork,
      simulated: false,
      raw,
    };
  } catch (error) {
    return maybeSimulateOrThrow('deploy', error, {
      appId: null,
      creatorAddress: null,
      raw: null,
    });
  }
};

const mintNftForWallet = async ({ userWallet, nftName, ipfsHash }) => {
  if (!userWallet) {
    throw new Error('userWallet is required');
  }

  const payload = {
    user_wallet: userWallet,
    nft_name: nftName,
    ipfs_hash: ipfsHash,
  };

  try {
    const raw = await runPythonScript('mint_nft.py', ['--json', JSON.stringify(payload)]);
    return {
      txId: raw.algo_tx_id || raw.transfer_tx_id || raw.mint_tx_id,
      mintTxId: raw.mint_tx_id || null,
      transferTxId: raw.transfer_tx_id || null,
      assetId: raw.asset_id || null,
      userWallet: raw.user_wallet || userWallet,
      network: raw.network || defaultNetwork,
      simulated: false,
      raw,
    };
  } catch (error) {
    return maybeSimulateOrThrow('nft_mint', error, {
      assetId: null,
      userWallet,
      raw: null,
    });
  }
};

const recordXpForWallet = async ({ userWallet, xp, questId, appId = null }) => {
  if (!userWallet) {
    throw new Error('userWallet is required');
  }

  const payload = {
    user_wallet: userWallet,
    xp: Number(xp),
    quest_id: String(questId),
  };
  if (appId !== null && appId !== undefined && appId !== '') {
    payload.app_id = Number(appId);
  }

  try {
    const raw = await runPythonScript('record_xp.py', ['--mode', 'record', '--json', JSON.stringify(payload)]);
    return {
      txId: raw.algo_tx_id || null,
      appId: raw.app_id || payload.app_id || null,
      userWallet: raw.user_wallet || userWallet,
      questId: raw.quest_id || String(questId),
      xp: Number(raw.xp || xp),
      network: raw.network || defaultNetwork,
      simulated: false,
      raw,
    };
  } catch (error) {
    return maybeSimulateOrThrow('proof', error, {
      appId: payload.app_id || null,
      userWallet,
      questId: String(questId),
      xp: Number(xp),
      raw: null,
    });
  }
};

const getUserAssets = async (walletAddress) => {
  const raw = await runPythonScript('get_user_assets.py', ['--wallet', walletAddress]);
  return {
    walletAddress,
    network: raw.network || defaultNetwork,
    assets: raw.assets || [],
    raw,
  };
};

const getUserXp = async (walletAddress) => {
  const raw = await runPythonScript('record_xp.py', ['--mode', 'get', '--wallet', walletAddress]);
  return {
    walletAddress,
    totalXp: Number(raw.total_xp || 0),
    events: raw.events || [],
    raw,
  };
};

const verifyTransaction = async (txId) => {
  const raw = await runPythonScript('verify_tx.py', ['--tx-id', txId]);
  return {
    txId: raw.tx_id || txId,
    confirmed: Boolean(raw.confirmed),
    confirmedRound: Number(raw.confirmed_round || 0),
    poolError: raw.pool_error || '',
    network: raw.network || defaultNetwork,
    raw,
  };
};

const recordProofTransaction = async (user, quest, xp) => {
  if (!user.algorand_wallet) {
    throw new Error('User does not have algorand_wallet for proof transaction');
  }

  const configuredAppId = process.env.ALGO_XP_APP_ID ? Number(process.env.ALGO_XP_APP_ID) : null;
  const chainResult = await recordXpForWallet({
    userWallet: user.algorand_wallet,
    xp: Number(xp || 0),
    questId: quest.id,
    appId: configuredAppId,
  });

  return {
    txId: chainResult.txId,
    network: chainResult.network,
    simulated: Boolean(chainResult.simulated),
    appId: chainResult.appId || configuredAppId,
    raw: chainResult.raw || null,
  };
};

const mintAchievementNFT = async (user, quest, definition = null) => {
  if (!user.algorand_wallet) {
    throw new Error('User does not have algorand_wallet for NFT minting');
  }

  const resolvedName =
    (definition && definition.name) ||
    (quest && quest.name) ||
    `Hacktera-${String(quest && quest.id ? quest.id : 'Achievement').slice(0, 24)}`;

  const resolvedIpfsHash = resolveNftIpfsHash(definition, quest);

  const chainResult = await mintNftForWallet({
    userWallet: user.algorand_wallet,
    nftName: resolvedName,
    ipfsHash: resolvedIpfsHash,
  });

  return {
    txId: chainResult.txId,
    assetId: chainResult.assetId,
    network: chainResult.network,
    simulated: Boolean(chainResult.simulated),
    raw: chainResult.raw || null,
  };
};

module.exports = {
  deployXpRegistry,
  mintNftForWallet,
  recordXpForWallet,
  getUserAssets,
  getUserXp,
  verifyTransaction,
  mintAchievementNFT,
  recordProofTransaction,
  scriptExists,
};
