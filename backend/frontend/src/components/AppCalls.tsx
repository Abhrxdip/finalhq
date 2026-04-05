import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import algosdk from 'algosdk'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface AppCallsInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const AppCalls = ({ openModal, setModalState }: AppCallsInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [appIdInput, setAppIdInput] = useState<string>('')
  const [counterValue, setCounterValue] = useState<number | null>(null)
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algodClient = new algosdk.Algodv2(algodConfig.token, algodConfig.server, algodConfig.port)

  const COUNTER_KEY = 'COUNT'

  const approvalProgramSource = `#pragma version 8
txn ApplicationID
int 0
==
bnz init

txna ApplicationArgs 0
byte "inc"
==
bnz increment

int 0
return

init:
byte "COUNT"
int 0
app_global_put
int 1
return

increment:
byte "COUNT"
byte "COUNT"
app_global_get
int 1
+
app_global_put
int 1
return
`

  const clearProgramSource = `#pragma version 8
int 1
`

  const decodeBase64ToUtf8 = (value: string) => {
    const raw = atob(value)
    const bytes = Uint8Array.from(raw, (char) => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  }

  const getCounterFromGlobalState = async (appId: number): Promise<number> => {
    const appResponse = await algodClient.getApplicationByID(appId).do()
    const globalState = appResponse?.params?.['global-state'] as
      | Array<{ key: string; value?: { uint?: number } }>
      | undefined

    if (!globalState || globalState.length === 0) {
      return 0
    }

    const counterEntry = globalState.find((entry) => decodeBase64ToUtf8(entry.key) === COUNTER_KEY)
    return Number(counterEntry?.value?.uint || 0)
  }

  const parseAppId = (): number | null => {
    const parsed = Number(appIdInput)
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return null
    }
    return parsed
  }

  const ensureWalletConnected = (): boolean => {
    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Connect a wallet provider first.', { variant: 'warning' })
      return false
    }
    return true
  }

  const compileTeal = async (source: string): Promise<Uint8Array> => {
    const response = await algodClient.compile(source).do()
    return algosdk.base64ToBytes(response.result)
  }

  const deployCounterContract = async () => {
    if (!ensureWalletConnected()) {
      return
    }

    setLoading(true)
    try {
      const [approvalProgram, clearProgram, suggestedParams] = await Promise.all([
        compileTeal(approvalProgramSource),
        compileTeal(clearProgramSource),
        algodClient.getTransactionParams().do(),
      ])

      const createTxn = algosdk.makeApplicationCreateTxnFromObject({
        sender: activeAddress as string,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram,
        clearProgram,
        numGlobalInts: 1,
        numGlobalByteSlices: 0,
        numLocalInts: 0,
        numLocalByteSlices: 0,
        suggestedParams,
      })

      const signedTxns = await transactionSigner!([createTxn], [0])
      const submit = await algodClient.sendRawTransaction(signedTxns).do()
      const confirmation = await algosdk.waitForConfirmation(algodClient, submit.txid, 4)

      const createdAppId = Number(confirmation['application-index'] || 0)
      if (!createdAppId) {
        throw new Error('App deployed but app id was not returned by the network.')
      }

      const currentValue = await getCounterFromGlobalState(createdAppId)
      setAppIdInput(String(createdAppId))
      setCounterValue(currentValue)
      enqueueSnackbar(`Counter contract deployed. App ID: ${createdAppId}`, { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(`Deploy failed: ${String((error as Error).message || error)}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const incrementCounter = async () => {
    if (!ensureWalletConnected()) {
      return
    }

    const appId = parseAppId()
    if (!appId) {
      enqueueSnackbar('Enter a valid App ID before incrementing.', { variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      const suggestedParams = await algodClient.getTransactionParams().do()
      const incrementTxn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: activeAddress as string,
        appIndex: appId,
        appArgs: [new TextEncoder().encode('inc')],
        suggestedParams,
      })

      const signedTxns = await transactionSigner!([incrementTxn], [0])
      const submit = await algodClient.sendRawTransaction(signedTxns).do()
      await algosdk.waitForConfirmation(algodClient, submit.txid, 4)

      const currentValue = await getCounterFromGlobalState(appId)
      setCounterValue(currentValue)
      enqueueSnackbar(`Counter incremented. Tx ID: ${submit.txid}`, { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(`Increment failed: ${String((error as Error).message || error)}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const refreshCounter = async () => {
    const appId = parseAppId()
    if (!appId) {
      enqueueSnackbar('Enter a valid App ID to fetch counter value.', { variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      const currentValue = await getCounterFromGlobalState(appId)
      setCounterValue(currentValue)
      enqueueSnackbar(`Fetched counter value for App ${appId}.`, { variant: 'info' })
    } catch (error) {
      enqueueSnackbar(`Read failed: ${String((error as Error).message || error)}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog id="appcalls_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg">On-chain counter (wallet signed)</h3>
        <br />
        <input
          type="text"
          placeholder="App ID (auto-filled after deploy)"
          className="input input-bordered w-full"
          value={appIdInput}
          onChange={(e) => {
            setAppIdInput(e.target.value)
          }}
        />
        <div className="text-sm mt-2">
          {counterValue === null ? 'Counter value: not loaded' : `Counter value: ${counterValue}`}
        </div>

        <div className="grid gap-2 mt-4">
          <button type="button" className="btn" onClick={deployCounterContract} disabled={loading}>
            {loading ? <span className="loading loading-spinner" /> : 'Deploy counter contract'}
          </button>
          <button type="button" className="btn" onClick={incrementCounter} disabled={loading}>
            {loading ? <span className="loading loading-spinner" /> : 'Increment counter'}
          </button>
          <button type="button" className="btn" onClick={refreshCounter} disabled={loading}>
            {loading ? <span className="loading loading-spinner" /> : 'Refresh counter'}
          </button>
        </div>

        <input
          type="text"
          placeholder="Connected wallet address"
          className="input input-bordered w-full"
          value={activeAddress || 'No wallet connected'}
          disabled
          readOnly
        />
        <div className="modal-action ">
          <button type="button" className="btn" onClick={() => setModalState(!openModal)}>
            Close
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default AppCalls
