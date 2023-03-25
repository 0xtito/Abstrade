import { useEffect } from "react";
import { ethers } from "ethers";
import { Event } from "ethers/lib/ethers";
import { useAccount } from "wagmi";

import LimitOrderAccountJSON from "../contracts/artifacts/LimitOrderAccount.json";
// import { limitOrderAccountAddress } from "../utils/constants";
const WebSocketUrl = process.env.NEXT_PUBLIC_GNOSIS_MAINNET_WS_URL!;

export const useOrderCreatedListener = (
  smartAccountAddress: string,
  setOrderCreated: React.Dispatch<React.SetStateAction<boolean>>,
  setTx: React.Dispatch<React.SetStateAction<string>>
) => {
  const { connector, isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected || !connector) return;

    const provider = new ethers.providers.WebSocketProvider(WebSocketUrl);
    const contract = new ethers.Contract(
      smartAccountAddress,
      LimitOrderAccountJSON.abi,
      provider
    );

    const onOrderCreated = (
      tokenOut: string,
      tokenIn: string,
      expiry: number,
      id: number,
      orderAmount: string,
      filledAmount: string,
      rate: string,
      event: Event
    ) => {
      console.log(
        "event triggered",
        event,
        event.address,
        smartAccountAddress,
        filledAmount,
        orderAmount,
        filledAmount === orderAmount,
        expiry
      );
      if (
        event.address.toLowerCase() === smartAccountAddress.toLowerCase() &&
        filledAmount === "0"
      ) {
        console.log("tx hash: ", event.transactionHash);
        console.log(`Order ${id} was filled`);
        setOrderCreated(true);
        setTx(event.transactionHash);
      }
    };

    contract.on("UpdateLimitOrder", onOrderCreated);

    return () => {
      contract.off("OrderFilled", onOrderCreated);
    };
  }, [isConnected]);
};
