import { http, createConfig} from 'wagmi'
import { /* base, mainnet, */ optimism } from 'wagmi/chains'
import { metaMask/* , walletConnect  */} from 'wagmi/connectors'

//const projectId = '<WALLETCONNECT_PROJECT_ID>'

export const config = createConfig({
  chains: [/* base, mainnet, */ optimism],
  connectors: [

    // walletConnect({ projectId }),
    metaMask(),

  ],
  transports: {
  //  [mainnet.id]: http(),
  //  [base.id]: http(),
    [optimism.id]: http(),
  },
})

