import { http, createConfig} from 'wagmi'
import { /* base, mainnet,optimism */Chain  } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'

const projectId =process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID  || "Oneblock Academy" 
// Asset‑Hub Westend Testnet
const assetHubWestendTestnet: Chain = {
  id: 888888,
  name: 'My ava Testnet',
 // network: 'My ava Testnet',
  nativeCurrency: {
    name: 'myava',
    symbol: 'myava',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:42829/ext/bc/Vv1L2e7PogfQ2n4wKs7dHv6f549bJQsdqNy5Fr8BVwegdu4fw/rpc'],
    },
    public: {
      http: ['http://127.0.0.1:42829/ext/bc/Vv1L2e7PogfQ2n4wKs7dHv6f549bJQsdqNy5Fr8BVwegdu4fw/rpc'],
    },
  },
 
  testnet: true,
}

export const config = createConfig({
  chains: [/* /* base, mainnet, optimism */assetHubWestendTestnet],
  connectors: [

    walletConnect({ projectId }),
    metaMask(),

  ],
  transports: {
  //  [mainnet.id]: http(),
  //  [base.id]: http(),
    [assetHubWestendTestnet.id]: http(),
  },
})
