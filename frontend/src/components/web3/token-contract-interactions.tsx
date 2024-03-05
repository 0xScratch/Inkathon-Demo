'use client'

import { FC, useEffect, useState } from 'react'

import { ContractIds } from '@/deployments/deployments'
import { zodResolver } from '@hookform/resolvers/zod'
import TokenContract from '@inkathon/contracts/typed-contracts/contracts/token'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
  useRegisteredTypedContract,
} from '@scio-labs/use-inkathon'
import { SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { contractTxWithToast } from '@/utils/contract-tx-with-toast'

const formSchema = z.object({
  value: z.number().min(1).max(1000),
})

export const TokenContractInteractions: FC = () => {
  const { api, activeAccount, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Token)
  const { typedContract } = useRegisteredTypedContract(ContractIds.Token, TokenContract)
  const [totalSupply, setTotalSupply] = useState<number>()
  const [balance, setBalance] = useState<any>()
  const [tokenName, setTokenName] = useState<string>()
  const [tokenSymbol, setTokenSymbol] = useState<string>()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const { register, reset, handleSubmit } = form

  const tokenSupply = async () => {
    console.log('tokenSupply function called')
    if (!contract || !typedContract || !api) {
      //   console.log(contract)
      console.log(typedContract)
      //   console.log(api)
      return
    }

    try {
      // typed result
      const typedResult = await typedContract.query.totalSupply()
      console.log('Result from typed contract:', typedResult.value.unwrap().toNumber())

      //   const result = await contractQuery(api, '', contract, 'totalSupply')
      //   console.log('contractQuery result:', result)
      //   const { output, isError, decodedOutput } = decodeOutput(result, contract, 'totalSupply')
      //   console.log('decodeOutput result:', output, isError, decodedOutput)
      //   if (isError) throw new Error(decodedOutput)
      setTotalSupply(typedResult.value.unwrap().toNumber())
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching token supply. Try again…')
    }
  }

  // Balance Of
  const balanceOf = async () => {
    if (!contract || !typedContract || !api) return

    try {
      //   const result = await contractQuery(api, '', contract, 'balanceOf', {}, [
      //     activeAccount?.address,
      //   ])
      //   const { output, isError, decodedOutput } = decodeOutput(result, contract, 'balanceOf')
      //   if (isError) throw new Error(decodedOutput)
      if (!activeAccount?.address) {
        console.log('No active account found')
        return
      }
      const accountId = activeAccount?.address
      console.log(typeof accountId)
      const typedResult = await typedContract.query.balanceOf(accountId)
      //   setBalance(typedResult.value.unwrap().toNumber())
      console.log('Result: ', typedResult.value)
      setBalance(typedResult.value.unwrap())
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching balance of. Try again…')
    }
  }

  // Name
  const name = async () => {
    if (!contract || !typedContract || !api) return
    try {
      //   const result = await contractQuery(api, '', contract, 'tokenName')
      //   const { output, isError, decodedOutput } = decodeOutput(result, contract, 'tokenName')
      //   if (isError) throw new Error(decodedOutput)
      //   setTokenName(output)

      const typedResult = await typedContract.query.tokenName()
      console.log('Result from typed contract:', typedResult.value.unwrap())
      setTokenName(typedResult.value.unwrap()?.toString())
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching token name. Try again…')
    }
  }

  // Symbol
  const symbol = async () => {
    if (!contract || !typedContract || !api) return
    try {
      // const result = await contractQuery(api, '', contract, 'tokenSymbol')
      // const { output, isError, decodedOutput } = decodeOutput(result, contract, 'tokenSymbol')
      // if (isError) throw new Error(decodedOutput)
      // setTokenSymbol(output)

      const typedResult = await typedContract.query.tokenSymbol()
      console.log('Result from typed contract:', typedResult.value.unwrap())
      setTokenSymbol(typedResult.value.unwrap()?.toString())
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching token symbol. Try again…')
    }
  }

  // Mint Token
  const mint: SubmitHandler<z.infer<typeof formSchema>> = async ({ value }) => {
    console.log('Mint function called with value:', value)
    if (!activeAccount || !contract || !activeSigner || !api || !typedContract) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    try {
      // Call the mint function with the active account address and the amount

      console.log('activeAccount: ', activeAccount)
      console.log('value: ', value)
      if (!activeAccount?.address) {
        console.log('No active account found')
        return
      }
      const tx = await typedContract.tx.mint(activeAccount.address, Number(value))
      console.log('tx: ', tx)
      // Send the transaction
      const txResult = await tx.send(activeAccount.address)

      if (txResult.isError) {
        throw new Error(`Failed to mint tokens: ${txResult.errorMessage}`)
      }

      reset()
    } catch (e) {
      console.error(e)
      // toast.error(`Error while minting tokens: ${e.message}`)
    } finally {
      tokenSupply()
      balanceOf()
    }
  }

  useEffect(() => {
    tokenSupply()
    balanceOf()
    name()
    symbol()
  }, [typedContract, activeAccount])

  if (!api) return null
  return (
    <>
      <div className="flex max-w-[22rem] grow flex-col gap-5">
        <h2 className="text-center font-mono text-gray-400">Token Smart Contract</h2>

        <Form {...form}>
          {/* Mint Tokens */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(mint)} className="flex flex-col justify-end gap-2">
                <FormItem>
                  <FormLabel className="text-base">Mint Tokens</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input disabled={form.formState.isSubmitting} {...register('value')} />
                      <Button
                        type="submit"
                        className="bg-primary font-bold"
                        disabled={form.formState.isSubmitting}
                        isLoading={form.formState.isSubmitting}
                        onClick={() => mint(form.getValues())}
                      >
                        Mint
                      </Button>
                    </div>
                  </FormControl>
                </FormItem>
              </form>
            </CardContent>
          </Card>

          {/* Token Information */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <FormItem>
                <FormLabel className="text-base">Total Supply</FormLabel>
                <FormControl>
                  <Input
                    placeholder={totalSupply ? totalSupply.toString() : 'Loading…'}
                    disabled={true}
                  />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel className="text-base">Balance</FormLabel>
                <FormControl>
                  <Input placeholder={balance ? balance.toString() : 'Loading…'} disabled={true} />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel className="text-base">Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder={tokenName ? tokenName.toString() : 'Loading...'}
                    disabled={true}
                  />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel className="text-base">Symbol</FormLabel>
                <FormControl>
                  <Input
                    placeholder={tokenSymbol ? tokenSymbol.toString() : 'Loading...'}
                    disabled={true}
                  />
                </FormControl>
              </FormItem>
            </CardContent>
          </Card>
        </Form>

        {/* Contract Address */}
        <p className="mb-10 text-center font-mono text-xs text-gray-600">
          {contract ? contractAddress : 'Loading…'}
        </p>
      </div>
    </>
  )
}
