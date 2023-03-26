import { useEffect } from "react";
import { ethers } from "ethers";
import { Event } from "ethers/lib/ethers";
import { useAccount } from "wagmi";
import { Connector } from "wagmi";

import LimitOrderAccountJSON from "../contracts/artifacts/LimitOrderAccount.json";
// import { limitOrderAccountAddress } from "../utils/constants";
const WebSocketUrl = process.env.NEXT_PUBLIC_GNOSIS_MAINNET_WS_URL!;

export const useOrderFulfilledListener = (
  smartAccountAddress: string,
  setOrderFulfilled: React.Dispatch<React.SetStateAction<boolean>>,
  setTx: React.Dispatch<React.SetStateAction<string>>,
  connector: Connector<any, any, any> | undefined
) => {
  // const { connector, isConnected } = useAccount();

  useEffect(() => {
    if (!connector) return;

    const provider = new ethers.providers.WebSocketProvider(WebSocketUrl);
    const contract = new ethers.Contract(
      smartAccountAddress,
      LimitOrderAccountJSON.abi,
      provider
    );

    const onOrderFilled = (
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
        filledAmount === orderAmount
      ) {
        console.log("tx hash: ", event.transactionHash);
        console.log(`Order ${id} was filled`);
        setOrderFulfilled(true);
        setTx(event.transactionHash);
      }
    };

    contract.on("UpdateLimitOrder", onOrderFilled);

    return () => {
      contract.off("OrderFilled", onOrderFilled);
    };
  }, []);
};
