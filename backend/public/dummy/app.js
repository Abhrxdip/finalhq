const peraWallet = window.PeraWalletConnect ? new window.PeraWalletConnect.PeraWalletConnect() : null

const els = {
  walletInput: document.getElementById('walletInput'),
  walletStatus: document.getElementById('walletStatus'),
  nftNameInput: document.getElementById('nftNameInput'),
  ipfsHashInput: document.getElementById('ipfsHashInput'),
  xpInput: document.getElementById('xpInput'),
  questIdInput: document.getElementById('questIdInput'),
  appIdInput: document.getElementById('appIdInput'),
  txIdInput: document.getElementById('txIdInput'),
  output: document.getElementById('output'),
  connectBtn: document.getElementById('connectBtn'),
  disconnectBtn: document.getElementById('disconnectBtn'),
  deployBtn: document.getElementById('deployBtn'),
  mintBtn: document.getElementById('mintBtn'),
  recordBtn: document.getElementById('recordBtn'),
  assetsBtn: document.getElementById('assetsBtn'),
  xpBtn: document.getElementById('xpBtn'),
  verifyBtn: document.getElementById('verifyBtn'),
}

const setOutput = (value) => {
  if (typeof value === 'string') {
    els.output.textContent = value
    return
  }
  els.output.textContent = JSON.stringify(value, null, 2)
}

const getWallet = () => els.walletInput.value.trim()

const callApi = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.message || payload.error || `Request failed with status ${response.status}`)
  }
  return payload
}

const withWallet = () => {
  const wallet = getWallet()
  if (!wallet) {
    throw new Error('Wallet address is required')
  }
  return wallet
}

els.connectBtn.addEventListener('click', async () => {
  try {
    if (!peraWallet) {
      throw new Error('Pera Wallet script not loaded. Use manual wallet input.')
    }
    const accounts = await peraWallet.connect()
    if (!accounts || !accounts[0]) {
      throw new Error('No wallet account returned from Pera')
    }
    els.walletInput.value = accounts[0]
    els.walletStatus.textContent = `Connected: ${accounts[0]}`
    setOutput({ connectedWallet: accounts[0] })
  } catch (error) {
    setOutput({ error: String(error.message || error) })
  }
})

els.disconnectBtn.addEventListener('click', async () => {
  try {
    if (peraWallet) {
      await peraWallet.disconnect()
    }
    els.walletStatus.textContent = 'Disconnected.'
    setOutput({ disconnected: true })
  } catch (error) {
    setOutput({ error: String(error.message || error) })
  }
})

els.deployBtn.addEventListener('click', async () => {
  try {
    const response = await callApi('/api/algo/deploy', { method: 'POST' })
    const appId = response?.deployment?.appId || response?.deployment?.app_id
    if (appId) {
      els.appIdInput.value = appId
    }
    setOutput(response)
  } catch (error) {
    setOutput({ error: String(error.message || error) })
  }
})

els.mintBtn.addEventListener('click', async () => {
  try {
    const response = await callApi('/api/algo/mint-nft', {
      method: 'POST',
      body: JSON.stringify({
        userWallet: withWallet(),
        nftName: els.nftNameInput.value.trim(),
        ipfsHash: els.ipfsHashInput.value.trim(),
      }),
    })
    const txId = response?.result?.txId || response?.result?.tx_id
    if (txId) {
      els.txIdInput.value = txId
    }
    setOutput(response)
  } catch (error) {
    setOutput({ error: String(error.message || error) })
  }
})

els.recordBtn.addEventListener('click', async () => {
  try {
    const appId = els.appIdInput.value.trim()
    const payload = {
      userWallet: withWallet(),
      xp: Number(els.xpInput.value),
      questId: els.questIdInput.value.trim(),
    }
    if (appId) {
      payload.appId = Number(appId)
    }

    const response = await callApi('/api/algo/record-xp', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    const txId = response?.result?.txId || response?.result?.tx_id
    if (txId) {
      els.txIdInput.value = txId
    }
    setOutput(response)
  } catch (error) {
    setOutput({ error: String(error.message || error) })
  }
})

els.assetsBtn.addEventListener('click', async () => {
  try {
    const response = await callApi(`/api/algo/user-assets/${withWallet()}`)
    setOutput(response)
  } catch (error) {
    setOutput({ error: String(error.message || error) })
  }
})

els.xpBtn.addEventListener('click', async () => {
  try {
    const response = await callApi(`/api/algo/user-xp/${withWallet()}`)
    setOutput(response)
  } catch (error) {
    setOutput({ error: String(error.message || error) })
  }
})

els.verifyBtn.addEventListener('click', async () => {
  try {
    const txId = els.txIdInput.value.trim()
    if (!txId) {
      throw new Error('Transaction ID is required')
    }
    const response = await callApi(`/api/algo/verify-tx/${txId}`)
    setOutput(response)
  } catch (error) {
    setOutput({ error: String(error.message || error) })
  }
})

setOutput({
  ready: true,
  info: 'Open /dummy and test blockchain routes via backend.',
})
