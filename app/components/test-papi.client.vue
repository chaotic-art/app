<script setup lang="ts">
import { ahp } from '@polkadot-api/descriptors'
import { createClient } from 'polkadot-api'
import { chainSpec } from 'polkadot-api/chains/polkadot'
import { getSmProvider } from 'polkadot-api/sm-provider'
import { startFromWorker } from 'polkadot-api/smoldot/from-worker'
import SmWorker from 'polkadot-api/smoldot/worker?worker'

const worker = new SmWorker()

const smoldot = startFromWorker(worker)
const chain = await smoldot.addChain({ chainSpec })

// Connect to the polkadot relay chain.
const client = createClient(
  getSmProvider(chain),
)

// With the `client`, you can get information such as subscribing to the last
// block to get the latest hash:
client.finalizedBlock$.subscribe(finalizedBlock =>
  // eslint-disable-next-line no-console
  console.log(finalizedBlock.number, finalizedBlock.hash),
)

// To interact with the chain, you need to get the `TypedApi`, which includes
// all the types for every call in that chain:
const api = client.getTypedApi(ahp)

// get the value for an account
const account = '16JGzEsi8gcySKjpmxHVrkLTHdFHodRepEz8n244gNZpr9J'
const accountInfo = await api.query.System.Account.getValue(account)
</script>

<template>
  <p>{{ account }} - {{ Number(accountInfo.data.free) }}</p>
</template>
