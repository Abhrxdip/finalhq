type HackquestFactoryConfig = {
  defaultSender?: string
  algorand: unknown
}

type DeployOptions = {
  onSchemaBreak?: unknown
  onUpdate?: unknown
}

type HelloCallArgs = {
  args: {
    name: string
  }
}

type HelloCallResponse = {
  return: string
}

type AppClient = {
  send: {
    hello: (input: HelloCallArgs) => Promise<HelloCallResponse>
  }
}

export class HackquestFactory {
  private readonly sender?: string

  constructor(config: HackquestFactoryConfig) {
    this.sender = config.defaultSender
  }

  async deploy(_options?: DeployOptions): Promise<{ appClient: AppClient }> {
    const senderSuffix = this.sender ? ` for ${this.sender}` : ''
    throw new Error(
      `Generated client missing: run \"npm run generate:app-clients\" after installing AlgoKit CLI to enable contract calls${senderSuffix}.`,
    )
  }
}
