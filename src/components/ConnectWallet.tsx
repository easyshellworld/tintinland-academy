"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { Button } from "@/components/ui/button";

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

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
        <Button
          variant="default"
          onClick={() => connect({ connector: metaMask() })}
          disabled={isPending}
        >
          {isPending ? "Connecting..." : "Connect MetaMask"}
        </Button>
      )}
    </div>
  );
}

// 工具函数：缩短地址
function shortenAddress(address?: `0x${string}`) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "N/A";
}
