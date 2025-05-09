"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMask,walletConnect } from "wagmi/connectors";
//import { subWalletConnector } from "@/lib/subwallet";
import { Button } from "@/components/ui/button";

const projectId =process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID  || "Oneblock Academy" 

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  //const subWallet = connectors.find((c) => c.id === subWalletConnector.id);

  return (
    <div className="flex flex-col items-center space-y-2">
      {isConnected ? (
        <>
          <p className="text-sm text-gray-600">Connected: {shortenAddress(address)}</p>
          <Button variant="destructive" onClick={() => disconnect()}>
            Disconnect
          </Button>
        </>
      ) : (
        <>
        <Button
          variant="default"
          onClick={() => connect({ connector: metaMask() })}
          disabled={isPending}
        >
          {isPending ? "Connecting..." : "Connect MetaMask"}
        </Button>
   
          {/*  walletConnect 按钮 */}
          <Button
            variant="default"
            onClick={() => connect({ connector:  walletConnect({ projectId }) })}
            disabled={isPending}
          >
            {isPending ? "Connecting..." : "Connect walletConnect"}
          </Button>
        </>
      )}
    </div>
  );
}

// 工具函数：缩短地址
function shortenAddress(address?: `0x${string}`) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "N/A";
}
