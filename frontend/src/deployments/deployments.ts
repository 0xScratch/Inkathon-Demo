import { SubstrateDeployment } from '@scio-labs/use-inkathon'

import { env } from '@/config/environment'

/**
 * Add or change your custom contract ids here
 * DOCS: https://github.com/scio-labs/inkathon#2-custom-contracts
 */
export enum ContractIds {
  Greeter = 'greeter',
  Token = 'token',
}

export const getDeployments = async (): Promise<SubstrateDeployment[]> => {
  const networks = env.supportedChains
  const deployments: SubstrateDeployment[] = []
  // console.log(networks)

  // for (const networkId of networks) {
  //   for (const contractId of Object.values(ContractIds)) {
  //     const abi = await import(`@inkathon/contracts/deployments/${contractId}/${contractId}.json`)
  //     // console.log(contractId, networkId)
  //     const { address } = await import(
  //       `@inkathon/contracts/deployments/${contractId}/${networkId}.ts`
  //     )

  //     deployments.push({ contractId, networkId, abi, address })
  //   }
  // }

  // Pushing Greeter contract
  const greeterAbi = await import(`@inkathon/contracts/deployments/greeter/greeter.json`)
  const greeterAddress = await import(`@inkathon/contracts/deployments/greeter/development`)

  deployments.push({
    contractId: ContractIds.Greeter,
    networkId: 'development',
    abi: greeterAbi,
    address: greeterAddress.address,
  })

  // Pushing Token contract
  const tokenAbi = await import(`@inkathon/contracts/deployments/token/token.json`)
  const tokenAddress = await import(`@inkathon/contracts/deployments/token/development`)

  deployments.push({
    contractId: ContractIds.Token,
    networkId: 'development',
    abi: tokenAbi,
    address: tokenAddress.address,
  })

  return deployments
}
